require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const multer     = require('multer');
const axios      = require('axios');
const ffmpeg     = require('fluent-ffmpeg');
const fs         = require('fs');
const os         = require('os');
const path       = require('path');
const { createClient } = require('@supabase/supabase-js');

const app    = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const HF_TOKEN   = process.env.HF_TOKEN;
// FLUX.1-schnell — free on HF inference router
const HF_IMG_URL = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';
const FRAMES     = 8;    // frames to generate per text-to-video
const TARGET_S   = 60;   // output video length in seconds

// ── Generate one image frame from HF free API ────────────────────
async function generateFrame(prompt) {
  const res = await axios.post(
    HF_IMG_URL,
    { inputs: prompt, parameters: { num_inference_steps: 4, guidance_scale: 3.5 } },
    {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'image/jpeg'
      },
      responseType: 'arraybuffer',
      timeout: 120000
    }
  );
  return Buffer.from(res.data);
}

// ── Stitch image buffers into a looped 60-second MP4 ─────────────
function framesToVideo(frameBuffers) {
  return new Promise((resolve, reject) => {
    const tmpDir   = fs.mkdtempSync(path.join(os.tmpdir(), 'vidai-'));
    const tmpOut   = path.join(os.tmpdir(), `vidai-out-${Date.now()}.mp4`);
    const listFile = path.join(tmpDir, 'list.txt');

    // Repeat frames enough times to fill TARGET_S seconds (1 frame per second)
    const repeats  = Math.ceil(TARGET_S / frameBuffers.length);
    let listContent = '';
    for (let r = 0; r < repeats; r++) {
      frameBuffers.forEach((buf, i) => {
        const imgPath = path.join(tmpDir, `frame${i}.jpg`);
        if (r === 0) fs.writeFileSync(imgPath, buf); // write once
        listContent += `file '${imgPath}'\nduration 1\n`;
      });
    }
    // FFmpeg concat needs a final entry with no duration
    const lastPath = path.join(tmpDir, `frame${frameBuffers.length - 1}.jpg`);
    listContent += `file '${lastPath}'\n`;
    fs.writeFileSync(listFile, listContent);

    ffmpeg()
      .input(listFile)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions([
        `-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1`,
        `-c:v libx264`,
        `-preset fast`,
        `-crf 23`,
        `-movflags +faststart`,
        `-t ${TARGET_S}`,
        `-pix_fmt yuv420p`
      ])
      .output(tmpOut)
      .on('end', () => {
        const buf = fs.readFileSync(tmpOut);
        try { fs.rmSync(tmpDir, { recursive: true }); fs.unlinkSync(tmpOut); } catch (_) {}
        resolve(buf);
      })
      .on('error', (err) => {
        try { fs.rmSync(tmpDir, { recursive: true }); } catch (_) {}
        reject(err);
      })
      .run();
  });
}

// ── Simple image → 60-second still video ─────────────────────────
function imageToVideo(imageBuffer, mimeType) {
  return new Promise((resolve, reject) => {
    const ext    = mimeType.includes('png') ? '.png' : '.jpg';
    const tmpIn  = path.join(os.tmpdir(), `vidai-in-${Date.now()}${ext}`);
    const tmpOut = path.join(os.tmpdir(), `vidai-out-${Date.now()}.mp4`);
    fs.writeFileSync(tmpIn, imageBuffer);

    ffmpeg(tmpIn)
      .inputOptions(['-loop 1', '-framerate 1'])
      .outputOptions([
        `-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1`,
        `-c:v libx264`,
        `-preset fast`,
        `-crf 23`,
        `-movflags +faststart`,
        `-t ${TARGET_S}`,
        `-pix_fmt yuv420p`,
        `-r 25`
      ])
      .output(tmpOut)
      .on('end', () => {
        const buf = fs.readFileSync(tmpOut);
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch (_) {}
        resolve(buf);
      })
      .on('error', (err) => {
        try { fs.unlinkSync(tmpIn); } catch (_) {}
        reject(err);
      })
      .run();
  });
}

// ── Upload to Supabase storage + save DB record ───────────────────
async function saveVideo(userId, videoBuffer, type, prompt) {
  const fileName = `${userId}/${Date.now()}.mp4`;
  const { error: upErr } = await supabase.storage
    .from('videos')
    .upload(fileName, videoBuffer, { contentType: 'video/mp4' });
  if (upErr) throw upErr;
  const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(fileName);
  await supabase.from('videos').insert({ user_id: userId, type, prompt, url: publicUrl, file_path: fileName });
  return publicUrl;
}

// ── Auth middleware ───────────────────────────────────────────────
async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
}

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ── Text → Video ─────────────────────────────────────────────────
app.post('/api/generate/text', requireAuth, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    console.log(`Generating ${FRAMES} frames for: "${prompt}"`);
    const framePromises = Array.from({ length: FRAMES }, (_, i) =>
      generateFrame(`${prompt}, scene ${i + 1}, cinematic, high quality`)
    );
    const frameBuffers = await Promise.all(framePromises);
    console.log('Frames done, stitching video...');
    const videoBuffer = await framesToVideo(frameBuffers);
    const publicUrl   = await saveVideo(req.user.id, videoBuffer, 'text-to-video', prompt);
    console.log('Video saved:', publicUrl);
    res.json({ success: true, url: publicUrl, prompt });

  } catch (err) {
    const s = err.response?.status;
    const detail = err.response?.data ? Buffer.from(err.response.data).toString().slice(0, 300) : err.message;
    console.error('T2V error:', s, detail);
    if (s === 503) return res.status(503).json({ error: 'Model loading — wait 30s and retry.' });
    if (s === 401) return res.status(401).json({ error: 'HuggingFace token invalid. Update HF_TOKEN in .env' });
    if (s === 429) return res.status(429).json({ error: 'Rate limited — wait a minute and retry.' });
    res.status(500).json({ error: detail || err.message || 'Generation failed' });
  }
});

// ── Image → Video (Ken Burns effect) ─────────────────────────────
app.post('/api/generate/image', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image required' });

  try {
    console.log('Creating Ken Burns video from uploaded image...');
    const videoBuffer = await imageToVideo(req.file.buffer, req.file.mimetype);
    const publicUrl   = await saveVideo(req.user.id, videoBuffer, 'image-to-video', 'Image upload');
    console.log('Image video saved:', publicUrl);
    res.json({ success: true, url: publicUrl });

  } catch (err) {
    console.error('I2V error:', err.message);
    res.status(500).json({ error: err.message || 'Video creation failed' });
  }
});

// ── Get user's videos ─────────────────────────────────────────────
app.get('/api/videos', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('videos').select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ videos: data });
});

// ── Delete a video ────────────────────────────────────────────────
app.delete('/api/videos/:id', requireAuth, async (req, res) => {
  const { data: vid } = await supabase
    .from('videos').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (!vid) return res.status(404).json({ error: 'Not found' });
  await supabase.storage.from('videos').remove([vid.file_path]);
  await supabase.from('videos').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ── Ensure Supabase storage bucket exists on startup ─────────────
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === 'videos');
  if (!exists) {
    const { error } = await supabase.storage.createBucket('videos', { public: true });
    if (error) console.error('Could not create videos bucket:', error.message);
    else console.log('Created "videos" storage bucket');
  } else {
    console.log('"videos" bucket ready');
  }
}

// ── Check videos table exists ─────────────────────────────────────
async function ensureTable() {
  const { error } = await supabase.from('videos').select('id').limit(1);
  if (error) console.error('videos table missing — run supabase-setup.sql in your Supabase SQL editor:', error.message);
  else console.log('"videos" table ready');
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`AI Video backend running on port ${PORT}`);
  await ensureBucket();
  await ensureTable();
});

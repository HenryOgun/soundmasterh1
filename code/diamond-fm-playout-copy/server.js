const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const os       = require('os');
const db       = require('./db');

// Use LOCAL date (not UTC) so servers in non-UTC timezones get the right day
function localDateStr(d) {
  const dt = d || new Date();
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { maxHttpBufferSize: 1e8 });

const PORT        = parseInt(process.env.PORT || 3000, 10);
const DATA_DIR    = process.env.DIAMOND_DATA_DIR || __dirname;
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const ARTWORK_DIR = path.join(DATA_DIR, 'artwork');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(ARTWORK_DIR)) fs.mkdirSync(ARTWORK_DIR, { recursive: true });

// ── Multer ────────────────────────────────────────────────────
const AUDIO_EXT = /\.(mp3|wav|m4a|flac|ogg|aac|wma|aiff|mp4|m4b|opus)$/i;

function getUploadsBase() {
  try {
    const row = db.get("SELECT value FROM settings WHERE key='uploads_dir'");
    if (row?.value) return row.value;
  } catch {}
  return UPLOADS_DIR;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const catId = req.body.category_id || 'uncategorized';
    const dir   = path.join(getUploadsBase(), String(catId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]/g, '_');
    cb(null, Date.now() + '_' + safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    AUDIO_EXT.test(file.originalname) ? cb(null, true) : cb(new Error('Unsupported format'));
  }
});

// ── CORS – allow all LAN origins (localhost, 192.168.x.x, 10.x.x.x, etc.)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Audio streaming with byte-range support ───────────────────
app.use(express.json());
app.use('/artwork', express.static(ARTWORK_DIR));
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Serve custom station logo from user-writable data dir (works inside ASAR packaging)
app.get('/images/station-logo.png', (req, res) => {
  const _dataDir = process.env.DIAMOND_DATA_DIR || path.join(__dirname, 'data');
  const _backup  = path.join(_dataDir, 'station-logo.png');
  res.setHeader('Cache-Control', 'no-store');
  if (fs.existsSync(_backup)) {
    try {
      const buf = fs.readFileSync(_backup);
      res.setHeader('Content-Type', 'image/png');
      return res.send(buf);
    } catch {}
  }
  // Fall back to bundled default logo
  try {
    const buf = fs.readFileSync(path.join(__dirname, 'public', 'images', 'diamond ilr 2.png'));
    res.setHeader('Content-Type', 'image/png');
    return res.send(buf);
  } catch {
    res.status(404).end();
  }
});

app.use(express.static(path.join(__dirname, 'public'), { etag: false, maxAge: 0 }));

const { spawn } = require('child_process');
const TRANSCODE_EXTS = new Set(['wma', 'aiff', 'aif', 'm4b']);

app.get('/audio/:catId/:filename', (req, res) => {
  const filepath = path.join(getUploadsBase(), req.params.catId, req.params.filename);
  if (!fs.existsSync(filepath)) return res.status(404).send('Not found');

  const ext = path.extname(filepath).slice(1).toLowerCase();

  // For formats Chromium can't decode natively, transcode to MP3 on-the-fly via ffmpeg
  if (TRANSCODE_EXTS.has(ext)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    const ff = spawn('ffmpeg', ['-i', filepath, '-vn', '-f', 'mp3', '-ab', '192k', 'pipe:1'], { stdio: ['ignore', 'pipe', 'pipe'] });
    ff.stdout.pipe(res);
    ff.stderr.on('data', () => {}); // suppress ffmpeg log output
    ff.on('error', (err) => {
      if (!res.headersSent) res.status(500).send('Transcoding failed: ' + err.message);
    });
    req.on('close', () => { try { ff.kill(); } catch {} });
    return;
  }

  const stat     = fs.statSync(filepath);
  const fileSize = stat.size;
  const range    = req.headers.range;
  const mimeMap  = { mp3:'audio/mpeg', wav:'audio/wav', m4a:'audio/mp4', flac:'audio/flac',
                     ogg:'audio/ogg', aac:'audio/aac', mp4:'audio/mp4', opus:'audio/opus' };
  const mime = mimeMap[ext] || 'audio/mpeg';

  const CHUNK = 512 * 1024; // 512KB chunks for smooth streaming
  if (range) {
    const [s, e]  = range.replace(/bytes=/, '').split('-');
    const start   = parseInt(s, 10);
    const end     = e ? parseInt(e, 10) : fileSize - 1;
    res.writeHead(206, { 'Content-Range':`bytes ${start}-${end}/${fileSize}`, 'Accept-Ranges':'bytes', 'Content-Length':end-start+1, 'Content-Type':mime });
    fs.createReadStream(filepath, { start, end, highWaterMark: CHUNK }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length':fileSize, 'Content-Type':mime, 'Accept-Ranges':'bytes' });
    fs.createReadStream(filepath, { highWaterMark: CHUNK }).pipe(res);
  }
});

// ── Track SELECT helper ───────────────────────────────────────
const T_SEL = `SELECT t.*, COALESCE(t.artwork_path,'') as artwork_path, COALESCE(t.sample_rate,0) as sample_rate, c.name as cat_name, c.color as cat_color, c.icon as cat_icon, c.type as cat_type
               FROM tracks t LEFT JOIN categories c ON t.category_id = c.id`;

// ── Categories ────────────────────────────────────────────────
app.get('/api/categories', (req, res) => res.json(db.query('SELECT * FROM categories ORDER BY position, name')));

app.post('/api/categories', (req, res) => {
  const { name, type, color, icon, parent_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const maxPos = db.get('SELECT MAX(position) as m FROM categories');
    const pos    = (maxPos?.m || 0) + 1;
    const r      = db.run('INSERT INTO categories (name,type,color,icon,position,parent_id) VALUES (?,?,?,?,?,?)', [name, type||'custom', color||'#4f8ef7', icon||'?', pos, parent_id||null]);
    const cat    = db.get('SELECT * FROM categories WHERE id=?', [r.lastInsertRowid]);
    io.emit('category-added', cat);
    res.json(cat);
  } catch { res.status(400).json({ error: 'Category already exists' }); }
});

app.put('/api/categories/:id', (req, res) => {
  const { name, color, icon } = req.body;
  db.run('UPDATE categories SET name=?,color=?,icon=? WHERE id=?', [name, color, icon, req.params.id]);
  const cat = db.get('SELECT * FROM categories WHERE id=?', [req.params.id]);
  io.emit('category-updated', cat);
  res.json(cat);
});

app.delete('/api/categories/:id', (req, res) => {
  const id = Number(req.params.id);
  // Nullify tracks that belong to this category or its sub-categories
  const subIds = db.query('SELECT id FROM categories WHERE parent_id=?', [id]).map(r => r.id);
  [id, ...subIds].forEach(cid => db.run('UPDATE tracks SET category_id=NULL WHERE category_id=?', [cid]));
  // Delete sub-categories first, then the category itself
  subIds.forEach(cid => { db.run('DELETE FROM categories WHERE id=?', [cid]); io.emit('category-deleted', { id: cid }); });
  db.run('DELETE FROM categories WHERE id=?', [id]);
  io.emit('category-deleted', { id });
  res.json({ ok: true });
});

// ── Filename parser ───────────────────────────────────────────
function parseAudioFilename(name) {
  let base = path.basename(name, path.extname(name));
  base = base.replace(/^\d+[\.\s\-]+/, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  const sep = base.indexOf(' - ');
  if (sep > 0) return { title: base.slice(sep + 3).trim(), artist: base.slice(0, sep).trim() };
  return { title: base, artist: '' };
}

// ── Tracks ────────────────────────────────────────────────────
app.get('/api/tracks', (req, res) => {
  const { category_id, search, type } = req.query;
  const limit  = Math.min(parseInt(req.query.limit)  || 300, 2000);
  const offset = parseInt(req.query.offset) || 0;
  let where = ' WHERE 1=1';
  const p = [];
  if (category_id) { where += ' AND t.category_id=?'; p.push(category_id); }
  if (type)        { where += ' AND c.type=?';         p.push(type); }
  if (search)      { where += ' AND (t.title LIKE ? OR t.artist LIKE ? OR t.album LIKE ?)'; p.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  const total = db.get(`SELECT COUNT(*) as n FROM tracks t LEFT JOIN categories c ON t.category_id=c.id${where}`, p)?.n || 0;
  const rows  = db.query(`${T_SEL}${where} ORDER BY t.created_at DESC LIMIT ${limit} OFFSET ${offset}`, p);
  res.json({ rows, total, limit, offset });
});

app.get('/api/tracks/:id', (req, res) => {
  const t = db.get(T_SEL + ' WHERE t.id=?', [req.params.id]);
  t ? res.json(t) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/tracks/upload', upload.array('files', 200), async (req, res) => {
  const { category_id, uploaded_by } = req.body;
  const results = [];
  for (const file of req.files) {
    // ── Duplicate guard ───────────────────────────────────────
    // Stored filenames are `<timestamp>_<safe_original>`. If a track with the
    // same safe original name already exists, delete the newly-uploaded file
    // and skip insertion to prevent duplicates.
    const safeOrig = file.originalname.replace(/[^\w.\-]/g, '_');
    const dupTrack = db.get("SELECT id FROM tracks WHERE filename LIKE ?", [`%_${safeOrig}`]);
    if (dupTrack) {
      try { fs.unlinkSync(file.path); } catch {}
      results.push({ duplicate: true, originalname: file.originalname, existing_id: dupTrack.id });
      continue;
    }

    const parsed = parseAudioFilename(file.originalname);
    let title = parsed.title;
    let artist = parsed.artist, album = '', duration = 0, artworkPath = '', sampleRate = 0;
    try {
      const mm   = require('music-metadata');
      const meta = await mm.parseFile(file.path, { duration: true, skipPostHeaders: true });
      duration   = meta.format.duration   || 0;
      sampleRate = meta.format.sampleRate || 0;
      title      = meta.common.title  || title;
      artist     = meta.common.artist || artist;
      album      = meta.common.album  || '';
      // Extract embedded album art
      if (meta.common.picture && meta.common.picture.length > 0) {
        const pic    = meta.common.picture[0];
        const ext    = pic.format.includes('png') ? 'png' : 'jpg';
        const artFile = Date.now() + '_' + path.basename(file.filename, path.extname(file.filename)) + '.' + ext;
        fs.writeFileSync(path.join(ARTWORK_DIR, artFile), pic.data);
        artworkPath = '/artwork/' + artFile;
      }
    } catch {}

    // Traffic/scheduler uploads always go into the Adverts category
    let catId = category_id || null;
    if (uploaded_by === 'Audio Editor' || uploaded_by === 'Traffic Upload') {
      const advertCat = db.get("SELECT id FROM categories WHERE type='advert' OR name LIKE '%dvert%' ORDER BY id LIMIT 1");
      if (advertCat) catId = advertCat.id;
    }
    const storedDir = path.basename(file.destination);
    const urlPath = `/audio/${storedDir}/${file.filename}`;
    const fmt     = path.extname(file.originalname).slice(1).toUpperCase();

    const r = db.run(`INSERT INTO tracks (title,artist,album,category_id,filename,filepath,url_path,duration,format,size,uploaded_by,artwork_path,sample_rate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [title, artist, album, catId, file.filename, file.path, urlPath, duration, fmt, file.size, uploaded_by||'Library', artworkPath, sampleRate]);

    const track = db.get(T_SEL + ' WHERE t.id=?', [r.lastInsertRowid]);
    results.push(track);
    io.emit('track-added', track);
  }
  res.json(results);
});

// ── Active track IDs (now-playing + queued across all clients) ─
app.get('/api/tracks/active-ids', (req, res) => {
  const ids = new Set();
  if (_globalNowPlaying?.id) ids.add(_globalNowPlaying.id);
  for (const [, state] of clientStates) {
    if (state.nowPlaying?.id) ids.add(state.nowPlaying.id);
    for (const t of (state.queue || [])) if (t?.id) ids.add(t.id);
  }
  res.json({ active_ids: [...ids] });
});

// ── Full library cleanup + deduplicate ────────────────────────
// POST /api/tracks/deduplicate
// 1. Scans every physical file on disk under the uploads folder.
// 2. Groups files + DB records by their true programme name (all leading
//    digit-underscore timestamp prefixes stripped).
// 3. Within each group keeps ONE copy:
//    – the track currently playing/queued (if any), else
//    – the DB record with the highest play_count (most used), else
//    – the DB record with the lowest id (oldest upload).
// 4. Deletes all other duplicates from disk + DB.
// 5. Also removes orphan disk files (no DB record) and broken DB records
//    (DB entry but file missing on disk).
app.post('/api/tracks/deduplicate', (req, res) => {
  // ── Active tracks (never touch these) ──────────────────────
  const activeIds       = new Set();
  const activeFilepaths = new Set();
  const addActive = t => {
    if (!t) return;
    if (t.id)       activeIds.add(t.id);
    if (t.filepath) activeFilepaths.add(t.filepath);
  };
  addActive(_globalNowPlaying);
  for (const [, state] of clientStates) {
    addActive(state.nowPlaying);
    for (const t of (state.queue || [])) addActive(t);
  }

  // Strip ONLY the first digit_ prefix (the multer upload timestamp).
  // The second timestamp (traffic file ID) is part of the identity — two files
  // with the same programme name but different traffic IDs are different episodes.
  // e.g. "1784478289395_1784478248717_AWISE.wav" → "1784478248717_AWISE.wav"
  //      "1784371916332_1784371805540_IN_TIME.wav" → "1784371805540_IN_TIME.wav"
  //      "1784371920431_1784371805540_IN_TIME.wav" → "1784371805540_IN_TIME.wav" ← same → duplicate ✓
  function stripTimestamps(filename) {
    return filename.replace(/^\d+_/, '');
  }

  // ── Scan every file physically on disk ─────────────────────
  const uploadsBase = getUploadsBase();
  const diskFiles   = new Map(); // absolute filepath → { filename, size }
  try {
    for (const catDir of fs.readdirSync(uploadsBase)) {
      const catPath = path.join(uploadsBase, catDir);
      try {
        if (!fs.statSync(catPath).isDirectory()) continue;
        for (const fname of fs.readdirSync(catPath)) {
          const fpath = path.join(catPath, fname);
          try {
            const stat = fs.statSync(fpath);
            if (stat.isFile()) diskFiles.set(fpath, { filename: fname, size: stat.size });
          } catch {}
        }
      } catch {}
    }
  } catch {}

  // ── All DB records (ordered: most-played first, then oldest id) ─
  const dbTracks  = db.query('SELECT id, filename, filepath, play_count FROM tracks ORDER BY play_count DESC, id ASC');
  const dbByPath  = new Map(dbTracks.map(t => [t.filepath, t]));

  // ── Build groups keyed by stripped programme name ───────────
  // Each group: { db: [...], orphans: [...] }
  const groups = {};
  const ensure = base => { if (!groups[base]) groups[base] = { db: [], orphans: [] }; };

  for (const t of dbTracks) {
    const base = stripTimestamps(t.filename);
    ensure(base);
    groups[base].db.push(t);
  }
  for (const [fpath, info] of diskFiles) {
    if (!dbByPath.has(fpath)) { // file exists on disk but not in DB → orphan
      const base = stripTimestamps(info.filename);
      ensure(base);
      groups[base].orphans.push({ filepath: fpath, filename: info.filename, size: info.size });
    }
  }

  // ── Process each group ──────────────────────────────────────
  let removedDb = 0, removedDisk = 0, brokenFixed = 0, freed = 0, skipped = 0, errors = [];

  for (const [, group] of Object.entries(groups)) {
    const { db: dbEntries, orphans } = group;

    // -- DB duplicates --
    if (dbEntries.length > 1) {
      const keeper = dbEntries.find(t => activeIds.has(t.id)) || dbEntries[0];
      for (const t of dbEntries) {
        if (t.id === keeper.id) continue;
        if (activeIds.has(t.id)) { skipped++; continue; }
        try { if (fs.existsSync(t.filepath)) { freed += fs.statSync(t.filepath).size; fs.unlinkSync(t.filepath); } } catch { errors.push(t.filename); }
        db.run('DELETE FROM tracks WHERE id=?', [t.id]);
        io.emit('track-deleted', { id: t.id });
        removedDb++;
      }
    }

    // -- Orphan disk files (same programme name as a DB entry, or totally orphaned) --
    for (const orphan of orphans) {
      if (activeFilepaths.has(orphan.filepath)) { skipped++; continue; }
      try { freed += orphan.size; fs.unlinkSync(orphan.filepath); removedDisk++; } catch { errors.push(orphan.filename); }
    }
  }

  // -- Broken DB records (file missing on disk) --
  for (const t of dbTracks) {
    if (!activeIds.has(t.id) && !fs.existsSync(t.filepath)) {
      db.run('DELETE FROM tracks WHERE id=?', [t.id]);
      io.emit('track-deleted', { id: t.id });
      brokenFixed++;
    }
  }

  res.json({ ok: true, removed_db: removedDb, removed_disk: removedDisk, broken_refs: brokenFixed, freed_bytes: freed, skipped, errors });
});

app.put('/api/tracks/:id', (req, res) => {
  const { title, artist, album, category_id, tags, genre, language, mood, tempo, era } = req.body;
  db.run('UPDATE tracks SET title=?,artist=?,album=?,category_id=?,tags=?,genre=?,language=?,mood=?,tempo=?,era=? WHERE id=?',
    [title, artist, album, category_id||null, JSON.stringify(tags||[]), genre||'', language||'', mood||'', tempo||'', era||'', req.params.id]);
  const t = db.get(T_SEL + ' WHERE t.id=?', [req.params.id]);
  io.emit('track-updated', t);
  res.json(t);
});

app.delete('/api/tracks/:id', (req, res) => {
  const t = db.get('SELECT * FROM tracks WHERE id=?', [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Not found' });
  try { fs.unlinkSync(t.filepath); } catch {}
  db.run('DELETE FROM tracks WHERE id=?', [req.params.id]);
  io.emit('track-deleted', { id: Number(req.params.id) });
  res.json({ ok: true });
});

// Save edited audio (WAV blob sent as raw body)
app.put('/api/tracks/:id/audio', express.raw({ type: 'audio/wav', limit: '500mb' }), async (req, res) => {
  const t = db.get('SELECT * FROM tracks WHERE id=?', [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const dir  = path.dirname(t.filepath);
  const base = path.basename(t.filepath, path.extname(t.filepath));
  const newPath = path.join(dir, base + '_edited.wav');
  const newUrl  = t.url_path.replace(/\/[^/]+$/, '/' + base + '_edited.wav');
  fs.writeFileSync(newPath, req.body);
  if (newPath !== t.filepath) { try { fs.unlinkSync(t.filepath); } catch {} }
  let duration = 0, sampleRate = 0;
  try {
    const mm   = require('music-metadata');
    const meta = await mm.parseFile(newPath, { duration: true });
    duration   = meta.format.duration   || 0;
    sampleRate = meta.format.sampleRate || 0;
  } catch {}
  const size = fs.statSync(newPath).size;
  db.run('UPDATE tracks SET filepath=?,filename=?,url_path=?,duration=?,size=?,format=?,sample_rate=? WHERE id=?',
    [newPath, path.basename(newPath), newUrl, duration, size, 'WAV', sampleRate, t.id]);
  const updated = db.get(T_SEL + ' WHERE t.id=?', [t.id]);
  io.emit('track-updated', updated);
  res.json(updated);
});

// ── Playlists ─────────────────────────────────────────────────
app.get('/api/playlists', (req, res) => res.json(db.query('SELECT * FROM playlists ORDER BY created_at DESC')));

app.post('/api/playlists', (req, res) => {
  const r = db.run('INSERT INTO playlists (name,description) VALUES (?,?)', [req.body.name, req.body.description||'']);
  res.json(db.get('SELECT * FROM playlists WHERE id=?', [r.lastInsertRowid]));
});

app.get('/api/playlists/:id/tracks', (req, res) => {
  res.json(db.query(`SELECT t.*, pi.position, c.name as cat_name, c.color as cat_color, c.icon as cat_icon
    FROM playlist_items pi JOIN tracks t ON pi.track_id=t.id LEFT JOIN categories c ON t.category_id=c.id
    WHERE pi.playlist_id=? ORDER BY pi.position`, [req.params.id]));
});

app.post('/api/playlists/:id/tracks', (req, res) => {
  const max = db.get('SELECT MAX(position) as m FROM playlist_items WHERE playlist_id=?', [req.params.id]);
  db.run('INSERT INTO playlist_items (playlist_id,track_id,position) VALUES (?,?,?)', [req.params.id, req.body.track_id, (max?.m||0)+1]);
  res.json({ ok: true });
});

app.delete('/api/playlists/:id', (req, res) => {
  db.run('DELETE FROM playlists WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ── Schedule ──────────────────────────────────────────────────
app.get('/api/schedule', (req, res) => {
  res.json(db.query(`SELECT s.*, t.title as track_title, t.artist as track_artist, t.duration as track_duration,
    c.name as cat_name, c.icon as cat_icon, p.name as playlist_name
    FROM schedule s LEFT JOIN tracks t ON s.track_id=t.id LEFT JOIN categories c ON t.category_id=c.id
    LEFT JOIN playlists p ON s.playlist_id=p.id ORDER BY s.start_time`));
});

app.post('/api/schedule', (req, res) => {
  const { title, track_id, playlist_id, start_time, days } = req.body;
  const r = db.run('INSERT INTO schedule (title,track_id,playlist_id,start_time,days) VALUES (?,?,?,?,?)',
    [title, track_id||null, playlist_id||null, start_time, JSON.stringify(days||['mon','tue','wed','thu','fri','sat','sun'])]);
  io.emit('schedule-updated');
  res.json(db.get('SELECT * FROM schedule WHERE id=?', [r.lastInsertRowid]));
});

app.put('/api/schedule/:id/toggle', (req, res) => {
  db.run('UPDATE schedule SET active=1-active WHERE id=?', [req.params.id]);
  io.emit('schedule-updated');
  res.json({ ok: true });
});

app.delete('/api/schedule/:id', (req, res) => {
  db.run('DELETE FROM schedule WHERE id=?', [req.params.id]);
  io.emit('schedule-updated');
  res.json({ ok: true });
});

// ── Ad Breaks ───────────────────────────────���─────────────────
app.get('/api/adbreaks', (req, res) => {
  const breaks = db.query(`
    SELECT b.*,
      COUNT(i.id) as item_count,
      COALESCE(SUM(t.duration),0) as total_dur
    FROM ad_breaks b
    LEFT JOIN ad_break_items i ON i.ad_break_id = b.id
    LEFT JOIN tracks t ON t.id = i.track_id
    GROUP BY b.id ORDER BY b.start_time`);
  res.json(breaks);
});

app.post('/api/adbreaks', (req, res) => {
  const { name, start_time, days } = req.body;
  if (!name || !start_time) return res.status(400).json({ error: 'Name and start_time required' });
  const r = db.run('INSERT INTO ad_breaks (name,start_time,days) VALUES (?,?,?)',
    [name, start_time, JSON.stringify(days || ['mon','tue','wed','thu','fri','sat','sun'])]);
  io.emit('adbreak-updated');
  res.json(db.get('SELECT * FROM ad_breaks WHERE id=?', [r.lastInsertRowid]));
});

app.put('/api/adbreaks/:id', (req, res) => {
  const { name, start_time, days } = req.body;
  db.run('UPDATE ad_breaks SET name=?,start_time=?,days=? WHERE id=?',
    [name, start_time, JSON.stringify(days || ['mon','tue','wed','thu','fri','sat','sun']), req.params.id]);
  io.emit('adbreak-updated');
  res.json(db.get('SELECT * FROM ad_breaks WHERE id=?', [req.params.id]));
});

app.put('/api/adbreaks/:id/toggle', (req, res) => {
  db.run('UPDATE ad_breaks SET active=1-active WHERE id=?', [req.params.id]);
  io.emit('adbreak-updated');
  res.json({ ok: true });
});

app.delete('/api/adbreaks/:id', (req, res) => {
  db.run('DELETE FROM ad_break_items WHERE ad_break_id=?', [req.params.id]);
  db.run('DELETE FROM ad_breaks WHERE id=?', [req.params.id]);
  io.emit('adbreak-updated');
  res.json({ ok: true });
});

app.get('/api/adbreaks/:id/items', (req, res) => {
  res.json(db.query(`
    SELECT i.id, i.ad_break_id, i.track_id, i.position,
      t.title, t.artist, t.duration, t.url_path,
      c.name as cat_name, c.color as cat_color, c.icon as cat_icon
    FROM ad_break_items i
    JOIN tracks t ON t.id = i.track_id
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE i.ad_break_id=? ORDER BY i.position`, [req.params.id]));
});

app.post('/api/adbreaks/:id/items', (req, res) => {
  const { track_id } = req.body;
  const max = db.get('SELECT MAX(position) as m FROM ad_break_items WHERE ad_break_id=?', [req.params.id]);
  const r = db.run('INSERT INTO ad_break_items (ad_break_id,track_id,position) VALUES (?,?,?)',
    [req.params.id, track_id, (max?.m || 0) + 1]);
  io.emit('adbreak-updated');
  res.json({ id: r.lastInsertRowid });
});

app.delete('/api/adbreaks/:breakId/items/:itemId', (req, res) => {
  db.run('DELETE FROM ad_break_items WHERE id=? AND ad_break_id=?', [req.params.itemId, req.params.breakId]);
  io.emit('adbreak-updated');
  res.json({ ok: true });
});

// ── Station Name ──────────────────────────────────────────────
// Combined settings for clock page
app.get('/api/settings', (req, res) => {
  const nameRow = db.get("SELECT value FROM settings WHERE key='station_name'");
  let trafficUrl = '';
  try { const r = tdb.prepare("SELECT value FROM station_settings WHERE key='remote_traffic_url'").get(); trafficUrl = r?.value || ''; } catch {}
  const getS = k => db.get("SELECT value FROM settings WHERE key=?", [k])?.value || '';
  res.json({
    station_name:    nameRow?.value || 'Henolla FM',
    traffic_url:     trafficUrl,
    footer_facebook: getS('footer_facebook'),
    footer_twitter:  getS('footer_twitter'),
    footer_instagram:getS('footer_instagram'),
    footer_ticker:   getS('footer_ticker'),
    footer_email:    getS('footer_email'),
    footer_phone:    getS('footer_phone'),
  });
});

app.post('/api/settings/social', (req, res) => {
  const keys = ['footer_facebook','footer_twitter','footer_instagram','footer_ticker','footer_email','footer_phone'];
  keys.forEach(k => {
    if (req.body[k] !== undefined) {
      db.run("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)", [k, req.body[k]]);
    }
  });
  res.json({ ok: true });
});

app.get('/api/settings/station-name', (req, res) => {
  const row = db.get("SELECT value FROM settings WHERE key='station_name'");
  res.json({ name: row?.value || 'Henolla FM' });
});

app.post('/api/settings/station-name', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name required' });
  db.run("INSERT OR REPLACE INTO settings (key,value) VALUES ('station_name',?)", [name]);
  io.emit('station-name-changed', { name });
  res.json({ ok: true });
});

// ── Network info ───��──────────────────────────────────────────
app.get('/api/network', (req, res) => {
  let localIP = 'localhost';
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        localIP = net.address; break;
      }
    }
  }
  const port = parseInt(process.env.DIAMOND_ACTUAL_PORT || 3000, 10);
  res.json({ ip: localIP, port, url: `http://${localIP}:${port}` });
});

// ── Filesystem directory browser ─────────────────────────────
app.get('/api/fs/dirs', (req, res) => {
  const raw     = (req.query.path || '').trim();
  const reqPath = raw ? path.resolve(raw) : '';
  // Reject paths that don't resolve to a valid absolute root
  if (reqPath) {
    const valid = process.platform === 'win32'
      ? /^[A-Za-z]:[\\\/]/.test(reqPath)
      : reqPath.startsWith('/');
    if (!valid) return res.status(400).json({ error: 'Invalid path' });
  }
  try {
    if (!reqPath) {
      // Root: drives on Windows, home dir on Unix
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        const drives = execSync('wmic logicaldisk get name', { timeout: 3000 })
          .toString().split('\n').map(s => s.trim()).filter(s => /^[A-Z]:$/.test(s));
        return res.json({ path: '', entries: drives.map(d => ({ name: d + '\\', fullPath: d + '\\' })), parent: null });
      }
      const home = os.homedir();
      return res.json({ path: home, entries: getDirEntries(home), parent: path.dirname(home) === home ? null : path.dirname(home) });
    }
    const parent = path.dirname(reqPath) === reqPath ? null : path.dirname(reqPath);
    res.json({ path: reqPath, entries: getDirEntries(reqPath), parent });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

function getDirEntries(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== '$RECYCLE.BIN' && d.name !== 'System Volume Information')
    .map(d => ({ name: d.name, fullPath: path.join(dirPath, d.name) }))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

// ── Uploads Path Setting ──────────────────────────────────────
app.get('/api/settings/uploads-dir', (req, res) => {
  const row = db.get("SELECT value FROM settings WHERE key='uploads_dir'");
  res.json({ path: row?.value || '' });
});

app.post('/api/settings/uploads-dir', (req, res) => {
  const newPath = (req.body.path || '').trim();
  if (newPath) {
    try {
      if (fs.existsSync(newPath)) {
        if (!fs.statSync(newPath).isDirectory()) return res.status(400).json({ error: 'Path exists but is not a folder' });
      } else {
        fs.mkdirSync(newPath, { recursive: true });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Cannot create/access path: ' + e.message });
    }
    db.run("INSERT OR REPLACE INTO settings (key,value) VALUES ('uploads_dir',?)", [newPath]);
  } else {
    // Empty = reset to default
    db.run("DELETE FROM settings WHERE key='uploads_dir'");
  }
  res.json({ ok: true });
});

// ── Station Logo ─────────────────────────────────────────────────────────────
// Custom logos are stored in DIAMOND_DATA_DIR (user-writable, outside ASAR).
// The GET /images/station-logo.png route above serves from there dynamically.
{
  const _dataDir = process.env.DIAMOND_DATA_DIR || path.join(__dirname, 'data');
  try { if (!fs.existsSync(_dataDir)) fs.mkdirSync(_dataDir, { recursive: true }); } catch {}
}
const _logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const okMime = /^image\/(png|jpeg|gif|webp|svg\+xml)$/.test(file.mimetype);
    const okExt  = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file.originalname);
    okMime && okExt ? cb(null, true) : cb(new Error('Image files only (PNG, JPG, GIF, WEBP, SVG)'));
  }
});
app.post('/api/upload-logo', _logoUpload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const _dataDir = process.env.DIAMOND_DATA_DIR || path.join(__dirname, 'data');
  const _backup  = path.join(_dataDir, 'station-logo.png');
  try { fs.writeFileSync(_backup, req.file.buffer); } catch(e) { console.warn('[logo] write failed:', e.message); }
  res.json({ ok: true });
});

// ── Auth ──────────────────────────────────────────────────────
app.get('/api/auth/needs-setup', (req, res) => {
  const row = db.get("SELECT value FROM settings WHERE key='app_password'");
  res.json({ needsSetup: !row });
});

app.post('/api/auth/setup', (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
  const existing = db.get("SELECT value FROM settings WHERE key='app_password'");
  if (existing) return res.status(400).json({ error: 'Password already set. Use Change Password.' });
  db.run("INSERT INTO settings (key,value) VALUES ('app_password',?)", [bcrypt.hashSync(password, 10)]);
  res.json({ ok: true });
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const row = db.get("SELECT value FROM settings WHERE key='app_password'");
  if (!row) return res.json({ ok: false, needsSetup: true });
  const stored = row.value;
  // Support legacy plaintext passwords and auto-upgrade them to bcrypt on login
  const isHashed = stored.startsWith('$2');
  const ok = isHashed ? bcrypt.compareSync(password, stored) : password === stored;
  if (ok && !isHashed) {
    db.run("UPDATE settings SET value=? WHERE key='app_password'", [bcrypt.hashSync(password, 10)]);
  }
  res.json({ ok });
});

app.post('/api/auth/change-password', (req, res) => {
  const { current, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
  const row = db.get("SELECT value FROM settings WHERE key='app_password'");
  const stored = row?.value;
  const correct = stored?.startsWith('$2') ? bcrypt.compareSync(current, stored) : current === stored;
  if (!correct) return res.status(401).json({ error: 'Current password is incorrect' });
  db.run("INSERT OR REPLACE INTO settings (key,value) VALUES ('app_password',?)", [bcrypt.hashSync(newPassword, 10)]);
  res.json({ ok: true });
});

// ── Admin: Clear playout schedule (playlist) ──────────────────
app.delete('/api/admin/clear-playlist', (req, res) => {
  try {
    db.run('DELETE FROM schedule');
    io.emit('schedule-updated');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Stats ─────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const totalTracks = db.get('SELECT COUNT(*) as n FROM tracks')?.n || 0;
  const totalSize   = db.get('SELECT SUM(size) as s FROM tracks')?.s || 0;
  const totalDur    = db.get('SELECT SUM(duration) as d FROM tracks')?.d || 0;
  const byCat       = db.query('SELECT c.name, c.color, c.icon, c.type, COUNT(t.id) as count FROM categories c LEFT JOIN tracks t ON t.category_id=c.id GROUP BY c.id ORDER BY c.position');
  const recentPlays = db.query('SELECT title, artist, play_count FROM tracks ORDER BY play_count DESC LIMIT 10');
  res.json({ totalTracks, totalSize, totalDur, byCat, recentPlays });
});

// ── Traffic Manager (integrated) ─────────────────────────────
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const tdb    = require('./traffic-db');

function getJwtSecret() {
  try {
    let s = tdb.prepare("SELECT value FROM station_settings WHERE key='jwt_secret'").get()?.value;
    if (!s) {
      s = require('crypto').randomBytes(48).toString('hex');
      tdb.prepare("INSERT OR REPLACE INTO station_settings (key,value) VALUES ('jwt_secret',?)").run(s);
    }
    return s;
  } catch { return 'dfm-fallback-secret'; }
}

function tAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(h.replace('Bearer ', ''), getJwtSecret()); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// Serve Traffic Manager UI
app.get('/traffic', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'traffic.html'));
});

// Traffic Auth
app.post('/traffic/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = tdb.prepare('SELECT * FROM users WHERE email=? AND active=1').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

// Traffic Dashboard
app.get('/traffic/api/dashboard', tAuth, (req, res) => {
  const now = new Date();
  const today = localDateStr(now);
  const d = new Date(); d.setDate(d.getDate() - d.getDay());
  const weekStart = localDateStr(d);
  const d2 = new Date(d); d2.setDate(d2.getDate()+6);
  const weekEnd = localDateStr(d2);
  const totalClients = tdb.prepare('SELECT COUNT(*) as c FROM clients WHERE active=1').get().c;
  const airedToday   = tdb.prepare("SELECT COUNT(*) as c FROM schedule_slots WHERE air_date=? AND status='aired'").get(today).c;
  const weekSlots    = tdb.prepare('SELECT COUNT(*) as c FROM schedule_slots WHERE air_date>=? AND air_date<=?').get(weekStart, weekEnd).c;
  const recentAired  = tdb.prepare("SELECT s.*,c.name as client_name FROM schedule_slots s LEFT JOIN clients c ON s.client_id=c.id WHERE s.status='aired' ORDER BY s.air_date DESC, s.air_time DESC LIMIT 8").all();
  const todaySlots   = tdb.prepare('SELECT s.*,c.name as client_name FROM schedule_slots s LEFT JOIN clients c ON s.client_id=c.id WHERE s.air_date=? ORDER BY s.air_time').all(today);
  res.json({ totalClients, airedToday, weekSlots, recentAired, todaySlots });
});

// Clients
app.get('/traffic/api/clients', tAuth, (req, res) => {
  res.json(tdb.prepare('SELECT c.*,ag.name as agency_name,a.name as agent_name FROM clients c LEFT JOIN agencies ag ON c.agency_id=ag.id LEFT JOIN agents a ON c.agent_id=a.id WHERE c.active=1 ORDER BY c.name').all());
});
app.post('/traffic/api/clients', tAuth, (req, res) => {
  try {
    const { name, contact_person, phone, email, address, industry, agency_id, agent_id, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Client name is required' });
    const r = tdb.prepare('INSERT INTO clients (name,contact_person,phone,email,address,industry,agency_id,agent_id,notes) VALUES (?,?,?,?,?,?,?,?,?)').run(name,contact_person||null,phone||null,email||null,address||null,industry||null,agency_id||null,agent_id||null,notes||null);
    res.json({ id: r.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/traffic/api/clients/:id', tAuth, (req, res) => {
  const { name, contact_person, phone, email, address, industry, agency_id, agent_id, notes } = req.body;
  tdb.prepare('UPDATE clients SET name=?,contact_person=?,phone=?,email=?,address=?,industry=?,agency_id=?,agent_id=?,notes=? WHERE id=?').run(name,contact_person||null,phone||null,email||null,address||null,industry||null,agency_id||null,agent_id||null,notes||null,req.params.id);
  res.json({ ok: true });
});
app.delete('/traffic/api/clients/:id', tAuth, (req, res) => {
  tdb.prepare('UPDATE clients SET active=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Agencies
app.get('/traffic/api/agencies', tAuth, (req, res) => {
  res.json(tdb.prepare('SELECT * FROM agencies WHERE active=1 ORDER BY name').all());
});
app.post('/traffic/api/agencies', tAuth, (req, res) => {
  try {
    const { name, contact_person, phone, email, address, commission_rate } = req.body;
    if (!name) return res.status(400).json({ error: 'Agency name is required' });
    const r = tdb.prepare('INSERT INTO agencies (name,contact_person,phone,email,address,commission_rate) VALUES (?,?,?,?,?,?)').run(name,contact_person||null,phone||null,email||null,address||null,commission_rate||0);
    res.json({ id: r.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/traffic/api/agencies/:id', tAuth, (req, res) => {
  const { name, contact_person, phone, email, address, commission_rate } = req.body;
  tdb.prepare('UPDATE agencies SET name=?,contact_person=?,phone=?,email=?,address=?,commission_rate=? WHERE id=?').run(name,contact_person||null,phone||null,email||null,address||null,commission_rate||0,req.params.id);
  res.json({ ok: true });
});
app.delete('/traffic/api/agencies/:id', tAuth, (req, res) => {
  tdb.prepare('UPDATE agencies SET active=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Agents
app.get('/traffic/api/agents', tAuth, (req, res) => {
  res.json(tdb.prepare('SELECT * FROM agents WHERE active=1 ORDER BY name').all());
});
app.post('/traffic/api/agents', tAuth, (req, res) => {
  try {
    const { name, phone, email, commission_rate } = req.body;
    if (!name) return res.status(400).json({ error: 'Agent name is required' });
    const r = tdb.prepare('INSERT INTO agents (name,phone,email,commission_rate) VALUES (?,?,?,?)').run(name,phone||null,email||null,commission_rate||0);
    res.json({ id: r.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/traffic/api/agents/:id', tAuth, (req, res) => {
  const { name, phone, email, commission_rate } = req.body;
  tdb.prepare('UPDATE agents SET name=?,phone=?,email=?,commission_rate=? WHERE id=?').run(name,phone||null,email||null,commission_rate||0,req.params.id);
  res.json({ ok: true });
});
app.delete('/traffic/api/agents/:id', tAuth, (req, res) => {
  tdb.prepare('UPDATE agents SET active=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Rate Cards
app.get('/traffic/api/rate-cards', tAuth, (req, res) => {
  res.json(tdb.prepare("SELECT * FROM rate_cards WHERE active=1 ORDER BY type,name").all());
});
app.post('/traffic/api/rate-cards', tAuth, (req, res) => {
  const { name, type, duration, rate, description } = req.body;
  const r = tdb.prepare('INSERT INTO rate_cards (name,type,duration,rate,description) VALUES (?,?,?,?,?)').run(name,type||'spot',duration||30,rate||0,description||null);
  res.json({ id: r.lastInsertRowid });
});
app.put('/traffic/api/rate-cards/:id', tAuth, (req, res) => {
  const { name, type, duration, rate, description } = req.body;
  tdb.prepare('UPDATE rate_cards SET name=?,type=?,duration=?,rate=?,description=? WHERE id=?').run(name,type,duration||30,rate||0,description||null,req.params.id);
  res.json({ ok: true });
});
app.delete('/traffic/api/rate-cards/:id', tAuth, (req, res) => {
  tdb.prepare('UPDATE rate_cards SET active=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Orders
function nextOrderNumber() {
  const yr = new Date().getFullYear();
  const last = tdb.prepare("SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY id DESC LIMIT 1").get(`ORD-${yr}-%`);
  if (!last) return `ORD-${yr}-0001`;
  const n = parseInt(last.order_number.split('-')[2]) + 1;
  return `ORD-${yr}-${String(n).padStart(4,'0')}`;
}
app.get('/traffic/api/orders', tAuth, (req, res) => {
  res.json(tdb.prepare('SELECT o.*,c.name as client_name,ag.name as agency_name,a.name as agent_name FROM orders o LEFT JOIN clients c ON o.client_id=c.id LEFT JOIN agencies ag ON o.agency_id=ag.id LEFT JOIN agents a ON o.agent_id=a.id ORDER BY o.created_at DESC').all());
});
app.get('/traffic/api/orders/:id', tAuth, (req, res) => {
  const order = tdb.prepare('SELECT o.*,c.name as client_name,c.address as client_address,c.phone as client_phone FROM orders o LEFT JOIN clients c ON o.client_id=c.id WHERE o.id=?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.items = tdb.prepare('SELECT oi.*,rc.name as rate_card_name FROM order_items oi LEFT JOIN rate_cards rc ON oi.rate_card_id=rc.id WHERE oi.order_id=?').all(req.params.id);
  res.json(order);
});
app.post('/traffic/api/orders', tAuth, (req, res) => {
  try {
    const { client_id, agency_id, agent_id, start_date, end_date, agency_commission, agent_commission, week_pattern, product_type, day_parts, day_schedule, specific_dates, schedule_mode, spots_per_day, material_title, audio_cut, material_ref, notes } = req.body;
    if (!client_id) return res.status(400).json({ error: 'client_id is required' });
    if (!start_date || !end_date) return res.status(400).json({ error: 'start_date and end_date are required' });
    const order_number = nextOrderNumber();
    const r = tdb.prepare('INSERT INTO orders (order_number,client_id,agency_id,agent_id,start_date,end_date,agency_commission,agent_commission,week_pattern,product_type,day_parts,day_schedule,specific_dates,schedule_mode,spots_per_day,material_title,audio_cut,material_ref,notes,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(order_number,client_id,agency_id||null,agent_id||null,start_date,end_date,agency_commission||0,agent_commission||0,week_pattern||'all',product_type||null,JSON.stringify(day_parts||[]),day_schedule?JSON.stringify(day_schedule):null,specific_dates?JSON.stringify(specific_dates):null,schedule_mode||'days',spots_per_day??null,material_title||null,audio_cut||null,material_ref||null,notes||null,'active',req.user.id);
    res.json({ id: r.lastInsertRowid, order_number });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/traffic/api/orders/:id', tAuth, (req, res) => {
  try {
    const { client_id, agency_id, agent_id, start_date, end_date, agency_commission, agent_commission, week_pattern, product_type, day_parts, day_schedule, specific_dates, schedule_mode, spots_per_day, material_title, audio_cut, material_ref, status, notes } = req.body;
    tdb.prepare('UPDATE orders SET client_id=?,agency_id=?,agent_id=?,start_date=?,end_date=?,agency_commission=?,agent_commission=?,week_pattern=?,product_type=?,day_parts=?,day_schedule=?,specific_dates=?,schedule_mode=?,spots_per_day=?,material_title=?,audio_cut=?,material_ref=?,status=?,notes=? WHERE id=?').run(client_id,agency_id||null,agent_id||null,start_date,end_date,agency_commission||0,agent_commission||0,week_pattern||'all',product_type||null,JSON.stringify(day_parts||[]),day_schedule?JSON.stringify(day_schedule):null,specific_dates?JSON.stringify(specific_dates):null,schedule_mode||'days',spots_per_day??null,material_title||null,audio_cut||null,material_ref||null,status||'active',notes||null,req.params.id);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete('/traffic/api/orders/:id', tAuth, (req, res) => {
  const id = req.params.id;
  tdb.prepare('DELETE FROM schedule_slots WHERE order_id=?').run(id);
  tdb.prepare('DELETE FROM order_items WHERE order_id=?').run(id);
  tdb.prepare('DELETE FROM orders WHERE id=?').run(id);
  res.json({ ok: true });
});

// Order Items
function recalcOrder(orderId) {
  const agg = tdb.prepare('SELECT COALESCE(SUM(spots),0) as ts,COALESCE(SUM(total_rate),0) as ta FROM order_items WHERE order_id=?').get(orderId);
  tdb.prepare('UPDATE orders SET total_spots=?,total_amount=? WHERE id=?').run(agg.ts, agg.ta, orderId);
}
app.post('/traffic/api/orders/:id/items', tAuth, (req, res) => {
  const { rate_card_id, description, spots, duration, unit_rate, days, time_slots, material_title, material_ref, break_position, audio_cut } = req.body;
  const total_rate = (unit_rate||0) * (spots||1);
  const r = tdb.prepare('INSERT INTO order_items (order_id,rate_card_id,description,spots,duration,unit_rate,total_rate,days,time_slots,material_title,material_ref,break_position,audio_cut) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(req.params.id,rate_card_id||null,description||null,spots||1,duration||30,unit_rate||0,total_rate,JSON.stringify(days||[]),JSON.stringify(time_slots||[]),material_title||null,material_ref||null,break_position||'any',audio_cut||null);
  recalcOrder(req.params.id);
  res.json({ id: r.lastInsertRowid });
});
app.put('/traffic/api/items/:id', tAuth, (req, res) => {
  const { rate_card_id, description, spots, duration, unit_rate, days, time_slots, material_title, material_ref } = req.body;
  const total_rate = (unit_rate||0) * (spots||1);
  const item = tdb.prepare('SELECT order_id FROM order_items WHERE id=?').get(req.params.id);
  tdb.prepare('UPDATE order_items SET rate_card_id=?,description=?,spots=?,duration=?,unit_rate=?,total_rate=?,days=?,time_slots=?,material_title=?,material_ref=? WHERE id=?').run(rate_card_id||null,description||null,spots||1,duration||30,unit_rate||0,total_rate,JSON.stringify(days||[]),JSON.stringify(time_slots||[]),material_title||null,material_ref||null,req.params.id);
  if (item) recalcOrder(item.order_id);
  res.json({ ok: true });
});
app.delete('/traffic/api/items/:id', tAuth, (req, res) => {
  const item = tdb.prepare('SELECT order_id FROM order_items WHERE id=?').get(req.params.id);
  tdb.prepare('DELETE FROM order_items WHERE id=?').run(req.params.id);
  if (item) recalcOrder(item.order_id);
  res.json({ ok: true });
});

// Traffic Schedule
app.get('/traffic/api/schedule/conflicts', tAuth, (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  const slots = tdb.prepare('SELECT s.*,c.industry as client_industry FROM schedule_slots s LEFT JOIN clients c ON s.client_id=c.id WHERE s.air_date=? ORDER BY s.air_time').all(date);
  const conflictIds = new Set();
  for (let i = 0; i < slots.length - 1; i++) {
    const a = slots[i], b = slots[i+1];
    const apt = a.product_type || a.client_industry;
    const bpt = b.product_type || b.client_industry;
    if (apt && bpt && apt.toLowerCase() === bpt.toLowerCase() && a.client_id !== b.client_id) {
      conflictIds.add(a.id); conflictIds.add(b.id);
    }
  }
  res.json([...conflictIds]);
});
// Distribute n slots evenly across broadcast day 06:00–22:00
function _distributeSlots(n) {
  const start = 6 * 60, end = 22 * 60;
  const interval = Math.floor((end - start) / (n + 1));
  return Array.from({length: n}, (_, i) => {
    const mins = start + interval * (i + 1);
    return `${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}:00`;
  });
}

// Helper — expand active orders into slot-like objects for a given date
function ordersToSlots(dateStr) {
  const dt = new Date(dateStr + 'T12:00:00');
  const dayOfMonth = String(dt.getDate()); // "1"–"31"
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayName = DAY_NAMES[dt.getDay()]; // fallback for old orders using day names
  const orders = tdb.prepare(
    "SELECT o.*, c.name as client_name FROM orders o LEFT JOIN clients c ON o.client_id=c.id " +
    "WHERE o.status='active' AND o.start_date<=? AND o.end_date>=?"
  ).all(dateStr, dateStr);

  console.log(`[traffic] ordersToSlots(${dateStr}) — dayOfMonth=${dayOfMonth}, dayName=${dayName}, active orders in range: ${orders.length}`);

  const slots = [];
  for (const o of orders) {
    const spd = (o.spots_per_day != null) ? parseInt(o.spots_per_day) : null;

    // ── Specific dates mode ───────────────────────────────────────────────────
    if (o.schedule_mode === 'specific') {
      let sd = {};
      try { sd = JSON.parse(o.specific_dates || '{}'); } catch {}
      const timesForDate = sd[dateStr];
      if (!timesForDate || !timesForDate.length) { console.log(`  order#${o.id} → skipped (specific_dates has no entry for ${dateStr})`); continue; }
      timesForDate.forEach(t => {
        slots.push({ id:`ord-${o.id}-${t}`, air_time:t||null, duration:o.duration||30, material_title:o.material_title||o.order_number, material_ref:o.material_ref||null, audio_cut:o.audio_cut||null, status:'scheduled', client_name:o.client_name||null, from_order:true, order_id:o.id });
      });
      continue;
    }

    // ── Per-day schedule (new method) ───────────────────────────────────────
    let ds = null;
    try { const p=JSON.parse(o.day_schedule||'{}'); if(p&&typeof p==='object'&&!Array.isArray(p)) ds=p; } catch {}
    if (ds && Object.keys(ds).length) {
      const dayTimes = ds[dayOfMonth];
      if (!dayTimes) { console.log(`  order#${o.id} → skipped (day ${dayOfMonth} not in day_schedule)`); continue; }
      let slotTimes;
      if (spd !== null) {
        if (spd === 0) continue;
        slotTimes = !dayTimes.length ? _distributeSlots(spd)
          : dayTimes.length >= spd ? dayTimes.slice(0, spd)
          : Array.from({length: spd}, (_, i) => dayTimes[i % dayTimes.length]);
      } else {
        slotTimes = dayTimes.length ? dayTimes : [''];
      }
      slotTimes.forEach((t, idx) => { slots.push({ id:`ord-${o.id}-${t||idx}`, air_time:t||null, duration:o.duration||30, material_title:o.material_title||o.order_number, material_ref:o.material_ref||null, audio_cut:o.audio_cut||null, status:'scheduled', client_name:o.client_name||null, from_order:true, order_id:o.id }); });
      continue;
    }

    // ── Legacy: week_pattern + day_parts ────────────────────────────────────
    let days = []; try { days = JSON.parse(o.week_pattern||'[]'); } catch {}
    console.log(`  order#${o.id} week_pattern=${o.week_pattern} → days=${JSON.stringify(days)}, start=${o.start_date}, end=${o.end_date}, audio_cut=${o.audio_cut}`);
    if (days.length) {
      const isNumber = days.some(d => !isNaN(Number(d)));
      if (isNumber && !days.includes(dayOfMonth)) { console.log(`    → skipped (dayOfMonth ${dayOfMonth} not in [${days}])`); continue; }
      if (!isNumber && !days.includes(dayName))   { console.log(`    → skipped (dayName ${dayName} not in [${days}])`); continue; }
    }
    let times = []; try { times = JSON.parse(o.day_parts||'[]'); } catch {}
    let slotTimes;
    if (spd !== null) {
      if (spd === 0) { continue; }
      slotTimes = !times.length ? _distributeSlots(spd)
        : times.length >= spd ? times.slice(0, spd)
        : Array.from({length: spd}, (_, i) => times[i % times.length]);
    } else {
      slotTimes = times.length ? times : [''];
    }

    slotTimes.forEach((t, idx) => {
      slots.push({
        id: `ord-${o.id}-${t||idx}`,
        air_time: t || null,
        duration: o.duration || 30,
        material_title: o.material_title || o.order_number,
        material_ref: o.material_ref || null,
        audio_cut: o.audio_cut || null,
        status: 'scheduled',
        client_name: o.client_name || null,
        from_order: true,
        order_id: o.id
      });
    });
  }
  return slots;
}

// Public — no auth — used by playout UI deck indicators (upcoming only)
app.get('/api/traffic-upcoming', (req, res) => {
  try {
    const today = localDateStr();
    const explicit = tdb.prepare(
      "SELECT s.id, s.remote_id, s.air_time, s.duration, s.material_title, s.material_ref, s.audio_cut, s.status, c.name as client_name " +
      "FROM schedule_slots s LEFT JOIN clients c ON s.client_id=c.id " +
      "WHERE s.air_date=? AND s.status='scheduled' ORDER BY s.air_time"
    ).all(today);
    // Also fetch aired rows for today so order-generated slots that already played are suppressed
    const aired = tdb.prepare(
      "SELECT material_title, air_time, audio_cut FROM schedule_slots WHERE air_date=? AND status='aired'"
    ).all(today);
    const fromOrders = ordersToSlots(today).filter(os => {
      // Suppress virtual slot only when there's an explicit slot at the SAME time with same audio/title
      const sameTimeMatch = s => (s.air_time||'').slice(0,5) === (os.air_time||'').slice(0,5);
      if (explicit.find(s =>
        sameTimeMatch(s) && (
          (os.audio_cut && s.audio_cut && os.audio_cut === s.audio_cut) ||
          s.material_title === os.material_title
        )
      )) return false;
      // Against aired slots: MUST also match time — the same ad can air again later in the day
      if (aired.find(s =>
        ((os.audio_cut && s.audio_cut && os.audio_cut === s.audio_cut) ||
         s.material_title === os.material_title) &&
        (s.air_time||'').slice(0,5) === (os.air_time||'').slice(0,5)
      )) return false;
      return true;
    });
    const all = [...explicit, ...fromOrders].sort((a,b) => (a.air_time||'').localeCompare(b.air_time||''));
    res.json(all);
  } catch(e) { console.error(e); res.json([]); }
});

// Public — all slots for any date (day schedule panel in playout UI)
// Debug: show raw DB state for today
app.get('/api/debug/traffic-today', (req, res) => {
  const date = localDateStr();
  const rows = tdb.prepare("SELECT id, remote_id, air_time, material_title, status, played_at, remote_synced FROM schedule_slots WHERE air_date=? ORDER BY air_time").all(date);
  res.json({ date, rows });
});

app.get('/api/traffic-day', (req, res) => {
  try {
    const date = req.query.date || localDateStr();
    const explicit = tdb.prepare(
      "SELECT s.id, s.remote_id, s.air_time, s.duration, s.material_title, s.material_ref, s.audio_cut, s.status, c.name as client_name " +
      "FROM schedule_slots s LEFT JOIN clients c ON s.client_id=c.id " +
      "WHERE s.air_date=? ORDER BY s.air_time"
    ).all(date);
    // Build a map of aired explicit rows by title for broader time-window suppression
    const _airedMap = {};
    explicit.filter(s => s.status === 'aired').forEach(s => {
      const k = (s.material_title||'').toLowerCase().trim();
      if (!_airedMap[k]) _airedMap[k] = [];
      const [hh, mm] = (s.air_time||'00:00').slice(0,5).split(':').map(Number);
      _airedMap[k].push(hh*60 + (mm||0));
    });

    // Suppress virtual order slots where an explicit slot (scheduled OR aired) already exists.
    // For aired rows use a ±10-min window — played time may differ from the scheduled slot time.
    const fromOrders = ordersToSlots(date).filter(os => {
      // Exact-minute match against any explicit row (scheduled or aired)
      if (explicit.find(s => {
        const sameTime = (s.air_time||'').slice(0,5) === (os.air_time||'').slice(0,5);
        return (os.audio_cut && s.audio_cut && os.audio_cut === s.audio_cut && sameTime) ||
               (s.material_title === os.material_title && sameTime);
      })) return false;
      // Broader match against aired rows only — same title within 10 minutes
      const titleKey = (os.material_title||'').toLowerCase().trim();
      const [oh, om] = (os.air_time||'00:00').slice(0,5).split(':').map(Number);
      const osMin = oh*60 + (om||0);
      if ((_airedMap[titleKey]||[]).some(aMin => Math.abs(aMin - osMin) <= 10)) return false;
      return true;
    });
    // Suppress duplicate explicit rows (same title + same minute) — keep only one
    // Put scheduled rows first so they always win over stale aired rows at the same key
    const seen = new Set();
    const prioritized = [
      ...explicit.filter(s => s.status !== 'aired'),
      ...fromOrders,
      ...explicit.filter(s => s.status === 'aired')
    ];
    const deduped = prioritized.filter(s => {
      const key = `${(s.material_title||'').toLowerCase().trim()}|${(s.air_time||'').slice(0,5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const all = deduped.sort((a,b) => (a.air_time||'').localeCompare(b.air_time||''));
    console.log(`[traffic-day] date=${date} explicit=${explicit.length} fromOrders=${fromOrders.length} total=${all.length}`);
    res.json(all);
  } catch(e) { console.error(e); res.json([]); }
});

// Mark a slot as aired — called by playout when an advert finishes
app.post('/api/traffic-log', (req, res) => {
  const { slot_id, remote_id, material_title, slot_material_title, client_name, air_date, air_time, scheduled_time } = req.body;
  console.log('[traffic-log] IN:', { slot_id, remote_id, material_title, air_date, scheduled_time });
  // Mark aired in local schedule_slots
  const numId = slot_id && !String(slot_id).startsWith('ord-') ? parseInt(slot_id) : null;
  const preciseTime = air_time || null; // HH:MM:SS.mmm from playout
  let changed = 0;
  if (numId) {
    // Try by local id first, then by remote_id — keep air_time as scheduled time, store precise time in played_at
    const r = tdb.prepare("UPDATE schedule_slots SET status='aired', played_at=? WHERE id=?").run(preciseTime, numId);
    changed = r.changes;
    console.log('[traffic-log] UPDATE by id=' + numId + ' changes=' + changed);
    if (!changed) {
      const r2 = tdb.prepare("UPDATE schedule_slots SET status='aired', played_at=? WHERE remote_id=?").run(preciseTime, numId);
      changed = r2.changes;
      console.log('[traffic-log] UPDATE by remote_id=' + numId + ' changes=' + changed);
    }
  }
  // Fallback: match by title + date + closest scheduled time (handles order-generated slot_ids)
  if (!changed && material_title && air_date) {
    const hhmm = (scheduled_time || preciseTime || '').slice(0,5);
    const r3 = tdb.prepare(
      "UPDATE schedule_slots SET status='aired', played_at=? " +
      "WHERE id=(SELECT id FROM schedule_slots WHERE material_title=? AND air_date=? AND status='scheduled' " +
      "ORDER BY ABS((CAST(SUBSTR(COALESCE(air_time,'00:00'),1,2) AS INTEGER)*60+CAST(SUBSTR(COALESCE(air_time,'00:00'),4,2) AS INTEGER)) - " +
      "(CAST(SUBSTR(?,1,2) AS INTEGER)*60+CAST(SUBSTR(?,4,2) AS INTEGER))) LIMIT 1)"
    ).run(preciseTime, material_title, air_date, hhmm, hhmm);
    changed = r3.changes;
  }
  // If still nothing updated, the slot was a virtual order-generated slot (no row in schedule_slots).
  // Insert an aired row using the scheduled_time so dedup in traffic-upcoming matches the order slot.
  if (!changed && material_title && air_date) {
    try {
      const orderMatch = tdb.prepare(
        "SELECT client_id FROM orders WHERE material_title=? ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id DESC LIMIT 1"
      ).get(material_title);
      // Use the virtual slot's scheduled time so the dedup in traffic-day can suppress it correctly.
      // Fall back to scheduled_time from client, then the virtual slot lookup, then actual play time.
      let insertTime = scheduled_time || preciseTime || air_time || '00:00';
      if (!scheduled_time) {
        const virtualSlot = ordersToSlots(air_date).find(os => os.material_title === material_title);
        if (virtualSlot?.air_time) insertTime = virtualSlot.air_time.slice(0, 5);
      }
      tdb.prepare(
        "INSERT INTO schedule_slots (air_date,air_time,played_at,duration,material_title,client_id,status,notes,remote_synced) VALUES (?,?,?,?,?,?,?,?,0)"
      ).run(air_date, insertTime, preciseTime, 30, material_title, orderMatch?.client_id||null, 'aired', 'Auto-logged from playout');
    } catch(e2) { /* ignore duplicate insert errors */ }
  }
    // Push aired status to Traffic Manager
  // Use remote_id (Traffic Manager's own slot id) so the match is exact
  // Prefer remote_id sent directly from client; fall back to DB lookup
  const remoteSlot = (!remote_id && numId) ? tdb.prepare("SELECT remote_id FROM schedule_slots WHERE id=?").get(numId) : null;
  const tmSlotId = remote_id || remoteSlot?.remote_id || null;
  const remoteUrl = getRemoteTrafficUrl();
  if (remoteUrl) {
    // Send scheduled_time as air_time so the title+date+time fallback matches the original slot row
    const body = JSON.stringify({ slot_id: tmSlotId, material_title, client_name, air_date, air_time: scheduled_time || air_time });
    try {
      const parsed = new (require('url').URL)(remoteUrl.replace(/\/$/, '') + '/api/public/mark-aired');
      const opts = {
        hostname: parsed.hostname, port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      };
      const mod = parsed.protocol === 'https:' ? require('https') : http;
      const r = mod.request(opts, res => res.resume());
      r.on('error', e => console.warn('[traffic-log] push failed:', e.message));
      r.write(body); r.end();
    } catch(e) { console.warn('[traffic-log] push error:', e.message); }
  }
  // Push directly to peer playout PCs so they remove the slot immediately,
  // regardless of whether the Traffic Manager is online.
  _pushAiredToPeers(slot_id || null, material_title, air_date, scheduled_time || air_time);
  // Broadcast to all connected playout clients so they hide this slot immediately
  io.emit('slot-aired', { slot_id: numId, original_slot_id: slot_id || null, material_title: slot_material_title || material_title, air_date });
  res.json({ ok: true });
  // Clean up locally-cached TrafficSync audio that is no longer needed — deferred so it never blocks playback
  setTimeout(cleanupStaleTrafficSyncTracks, 3000);
});

app.get('/api/playout-log-report', (req, res) => {
  const date = req.query.date || localDateStr();
  try {
    const slots = tdb.prepare(`
      SELECT s.*, c.name AS client_name
      FROM schedule_slots s
      LEFT JOIN clients c ON c.id = s.client_id
      WHERE s.air_date = ?
      ORDER BY s.air_time ASC
    `).all(date);
    const nowMins = (() => { const n = new Date(); return n.getHours()*60+n.getMinutes(); })();
    const aired   = slots.filter(s => s.status === 'aired');
    const missed  = slots.filter(s => {
      if (s.status === 'aired') return false;
      if (!s.air_time) return false;
      const [h, m] = s.air_time.split(':').map(Number);
      return (h*60+m) <= nowMins;
    });
    const upcoming = slots.filter(s => {
      if (s.status === 'aired') return false;
      if (!s.air_time) return false;
      const [h, m] = s.air_time.split(':').map(Number);
      return (h*60+m) > nowMins;
    });
    res.json({ date, aired, missed, upcoming, total: slots.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/traffic/api/schedule', tAuth, (req, res) => {
  const { date } = req.query;
  const BASE = `SELECT s.*,
    COALESCE(c.name, c2.name,
      (SELECT cl.name FROM orders oo JOIN clients cl ON oo.client_id=cl.id
       WHERE (oo.audio_cut=s.audio_cut OR oo.material_ref=s.audio_cut OR oo.material_title=s.material_title)
       ORDER BY CASE oo.status WHEN 'active' THEN 0 ELSE 1 END, oo.id DESC LIMIT 1)
    ) as client_name,
    COALESCE(s.client_id, o.client_id,
      (SELECT oo.client_id FROM orders oo
       WHERE (oo.audio_cut=s.audio_cut OR oo.material_ref=s.audio_cut OR oo.material_title=s.material_title)
       ORDER BY CASE oo.status WHEN 'active' THEN 0 ELSE 1 END, oo.id DESC LIMIT 1)
    ) as effective_client_id
    FROM schedule_slots s
    LEFT JOIN clients c  ON s.client_id=c.id
    LEFT JOIN orders  o  ON s.order_id=o.id
    LEFT JOIN clients c2 ON o.client_id=c2.id `;
  if (date) {
    res.json(tdb.prepare(BASE + 'WHERE s.air_date=? ORDER BY s.air_time').all(date));
  } else {
    const limit = Math.min(parseInt(req.query.limit)||200, 5000);
    res.json(tdb.prepare(BASE + `ORDER BY s.air_date,s.air_time LIMIT ${limit}`).all());
  }
});
app.post('/traffic/api/schedule', tAuth, (req, res) => {
  const { order_id, order_item_id, client_id, air_date, air_time, duration, material_title, material_ref, day_part, break_position, audio_cut, break_number, product_type, notes } = req.body;
  const r = tdb.prepare('INSERT INTO schedule_slots (order_id,order_item_id,client_id,air_date,air_time,duration,material_title,material_ref,day_part,break_position,audio_cut,break_number,product_type,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(order_id||null,order_item_id||null,client_id||null,air_date,air_time,duration||30,material_title||null,material_ref||null,day_part||null,break_position||'any',audio_cut||null,break_number||1,product_type||null,notes||null);
  res.json({ id: r.lastInsertRowid });
});
app.put('/traffic/api/schedule/:id', tAuth, (req, res) => {
  const { air_date, air_time, duration, material_title, material_ref, day_part, break_position, audio_cut, break_number, product_type, status, notes } = req.body;
  tdb.prepare('UPDATE schedule_slots SET air_date=?,air_time=?,duration=?,material_title=?,material_ref=?,day_part=?,break_position=?,audio_cut=?,break_number=?,product_type=?,status=?,notes=? WHERE id=?').run(air_date,air_time,duration||30,material_title||null,material_ref||null,day_part||null,break_position||'any',audio_cut||null,break_number||1,product_type||null,status||'scheduled',notes||null,req.params.id);
  res.json({ ok: true });
});
app.delete('/traffic/api/schedule/:id', tAuth, (req, res) => {
  tdb.prepare('DELETE FROM schedule_slots WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
// Assign/reassign a client to an existing slot
app.patch('/traffic/api/schedule/:id/assign-client', tAuth, (req, res) => {
  const { client_id } = req.body;
  tdb.prepare('UPDATE schedule_slots SET client_id=? WHERE id=?').run(client_id||null, req.params.id);
  res.json({ ok: true });
});
// Bulk-assign all unlinked slots in a date range to a client
app.patch('/traffic/api/schedule/bulk-assign-client', tAuth, (req, res) => {
  const { client_id, date_from, date_to } = req.body;
  if (!client_id) return res.status(400).json({ error: 'client_id required' });
  let q = 'UPDATE schedule_slots SET client_id=? WHERE client_id IS NULL';
  const params = [client_id];
  if (date_from) { q += ' AND air_date>=?'; params.push(date_from); }
  if (date_to)   { q += ' AND air_date<=?'; params.push(date_to); }
  const r = tdb.prepare(q).run(...params);
  res.json({ ok: true, updated: r.changes });
});

// Log-play endpoint (called by playout directly)
app.post('/traffic/api/log-play', (req, res) => {
  try {
    const { material_title, material_ref, duration, played_at } = req.body;
    if (!material_title) return res.status(400).json({ error: 'material_title required' });
    const dt = played_at ? new Date(played_at) : new Date();
    const air_date = localDateStr(dt);
    const air_time = dt.toTimeString().slice(0, 8);
    const hhmm2 = air_time.slice(0,5);
    const existing = tdb.prepare(
      "SELECT id FROM schedule_slots WHERE air_date=? AND material_title=? AND status='scheduled' " +
      "ORDER BY ABS((CAST(SUBSTR(COALESCE(air_time,'00:00'),1,2) AS INTEGER)*60+CAST(SUBSTR(COALESCE(air_time,'00:00'),4,2) AS INTEGER)) - " +
      "(CAST(SUBSTR(?,1,2) AS INTEGER)*60+CAST(SUBSTR(?,4,2) AS INTEGER))) LIMIT 1"
    ).get(air_date, material_title, hhmm2, hhmm2);
    if (existing) {
      tdb.prepare("UPDATE schedule_slots SET status='aired', air_time=? WHERE id=?").run(air_time, existing.id);
    } else {
      const orderMatch = tdb.prepare(
        "SELECT client_id FROM orders WHERE (audio_cut=? OR material_ref=? OR material_title=?) ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id DESC LIMIT 1"
      ).get(material_ref||'', material_ref||'', material_title||'');
      const clientId = orderMatch?.client_id || null;
      tdb.prepare('INSERT INTO schedule_slots (air_date,air_time,duration,material_title,material_ref,client_id,status,notes) VALUES (?,?,?,?,?,?,?,?)').run(air_date, air_time, Math.round(duration||30), material_title, material_ref||null, clientId, 'aired', 'Auto-logged from Henolla Playout');
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Log Templates
app.get('/traffic/api/log-templates', tAuth, (req, res) => {
  const templates = tdb.prepare('SELECT * FROM log_templates WHERE active=1 ORDER BY name').all();
  templates.forEach(t => { t.breaks = tdb.prepare('SELECT * FROM template_breaks WHERE template_id=? ORDER BY break_number').all(t.id); });
  res.json(templates);
});
app.post('/traffic/api/log-templates', tAuth, (req, res) => {
  try {
    const { name, description, type } = req.body;
    if (!name) return res.status(400).json({ error: 'Template name is required' });
    const r = tdb.prepare('INSERT INTO log_templates (name,description,type) VALUES (?,?,?)').run(name, description||null, type||'standard');
    res.json({ id: r.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/traffic/api/log-templates/:id', tAuth, (req, res) => {
  const { name, description, type } = req.body;
  tdb.prepare('UPDATE log_templates SET name=?,description=?,type=? WHERE id=?').run(name, description||null, type||'standard', req.params.id);
  res.json({ ok: true });
});
app.delete('/traffic/api/log-templates/:id', tAuth, (req, res) => {
  tdb.prepare('UPDATE log_templates SET active=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
app.post('/traffic/api/log-templates/:id/breaks', tAuth, (req, res) => {
  const { break_number, break_time, duration, day_part, fill_rule, notes } = req.body;
  const r = tdb.prepare('INSERT INTO template_breaks (template_id,break_number,break_time,duration,day_part,fill_rule,notes) VALUES (?,?,?,?,?,?,?)').run(req.params.id, break_number||1, break_time, duration||300, day_part||null, fill_rule||'sequential', notes||null);
  res.json({ id: r.lastInsertRowid });
});
app.delete('/traffic/api/template-breaks/:id', tAuth, (req, res) => {
  tdb.prepare('DELETE FROM template_breaks WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
app.post('/traffic/api/log-templates/:id/apply', tAuth, (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  const tpl = tdb.prepare('SELECT name FROM log_templates WHERE id=?').get(req.params.id);
  const breaks = tdb.prepare('SELECT * FROM template_breaks WHERE template_id=? ORDER BY break_number').all(req.params.id);
  breaks.forEach(b => {
    tdb.prepare('INSERT INTO schedule_slots (air_date,air_time,duration,status,day_part,break_number,notes) VALUES (?,?,?,?,?,?,?)').run(date, b.break_time, b.duration, 'scheduled', b.day_part||null, b.break_number, `Template: ${tpl?.name||''} break ${b.break_number}`);
  });
  res.json({ ok: true, created: breaks.length });
});

// Day Parts
app.get('/traffic/api/day-parts', tAuth, (req, res) => {
  res.json(tdb.prepare('SELECT * FROM day_parts ORDER BY sort_order').all());
});
app.post('/traffic/api/day-parts', tAuth, (req, res) => {
  try {
    const { name, start_time, end_time, sort_order } = req.body;
    if (!name || !start_time || !end_time) return res.status(400).json({ error: 'name, start_time and end_time are required' });
    const r = tdb.prepare('INSERT INTO day_parts (name,start_time,end_time,sort_order) VALUES (?,?,?,?)').run(name, start_time, end_time, sort_order||0);
    res.json({ id: r.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/traffic/api/day-parts/:id', tAuth, (req, res) => {
  const { name, start_time, end_time, sort_order } = req.body;
  tdb.prepare('UPDATE day_parts SET name=?,start_time=?,end_time=?,sort_order=? WHERE id=?').run(name, start_time, end_time, sort_order||0, req.params.id);
  res.json({ ok: true });
});
app.delete('/traffic/api/day-parts/:id', tAuth, (req, res) => {
  tdb.prepare('DELETE FROM day_parts WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Traffic Settings & Users
app.get('/traffic/api/settings', tAuth, (req, res) => {
  const rows = tdb.prepare('SELECT key,value FROM station_settings').all();
  const s = {}; rows.forEach(r => s[r.key] = r.value); res.json(s);
});
app.put('/traffic/api/settings', tAuth, (req, res) => {
  const stmt = tdb.prepare('INSERT OR REPLACE INTO station_settings (key,value) VALUES (?,?)');
  Object.entries(req.body).forEach(([k,v]) => stmt.run(k, String(v)));
  res.json({ ok: true });
});
app.get('/traffic/api/users', tAuth, (req, res) => {
  res.json(tdb.prepare('SELECT id,name,email,role,active,created_at FROM users ORDER BY name').all());
});
app.post('/traffic/api/users', tAuth, (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const r = tdb.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)').run(name,email,hash,role||'sales');
    res.json({ id: r.lastInsertRowid });
  } catch { res.status(400).json({ error: 'Email already exists' }); }
});
app.put('/traffic/api/users/:id', tAuth, (req, res) => {
  const { name, email, role, active, password } = req.body;
  if (password) {
    tdb.prepare('UPDATE users SET name=?,email=?,role=?,active=?,password=? WHERE id=?').run(name,email,role,active??1,bcrypt.hashSync(password,10),req.params.id);
  } else {
    tdb.prepare('UPDATE users SET name=?,email=?,role=?,active=? WHERE id=?').run(name,email,role,active??1,req.params.id);
  }
  res.json({ ok: true });
});
app.delete('/traffic/api/users/:id', tAuth, (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  tdb.prepare('UPDATE users SET active=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Traffic Reports
app.get('/traffic/api/reports', tAuth, (req, res) => {
  const byMonth  = tdb.prepare("SELECT strftime('%Y-%m',datetime(created_at,'unixepoch')) as month,COALESCE(SUM(total_amount),0) as revenue,COUNT(*) as orders FROM orders WHERE status!='cancelled' GROUP BY month ORDER BY month DESC LIMIT 12").all();
  const byClient = tdb.prepare("SELECT c.name as client_name,COUNT(o.id) as orders,COALESCE(SUM(o.total_amount),0) as revenue FROM orders o LEFT JOIN clients c ON o.client_id=c.id WHERE o.status!='cancelled' GROUP BY o.client_id ORDER BY revenue DESC LIMIT 20").all();
  const byAgent  = tdb.prepare("SELECT a.name as agent_name,COUNT(o.id) as orders,COALESCE(SUM(o.total_amount),0) as revenue FROM orders o LEFT JOIN agents a ON o.agent_id=a.id WHERE o.status!='cancelled' AND o.agent_id IS NOT NULL GROUP BY o.agent_id ORDER BY revenue DESC").all();
  const statusSummary = tdb.prepare("SELECT status,COUNT(*) as count,COALESCE(SUM(total_amount),0) as amount FROM orders GROUP BY status").all();
  res.json({ byMonth, byClient, byAgent, statusSummary });
});

// ── Advert auto-logging (direct call — no HTTP needed now) ────
function logAdvertToTrafficManager(track) {
  try {
    console.log('[traffic-log] track:', track.title, '| _fromTraffic:', track._fromTraffic);
    // Primary signal: track was added from the traffic panel (_fromTraffic)
    // Fallback: category name/type matches known advert categories
    const fromTraffic = !!track._fromTraffic;
    if (!fromTraffic) {
      const cat = track.category_id ? db.get('SELECT type FROM categories WHERE id=?', [track.category_id]) : null;
      const catType = (cat?.type || '').toLowerCase();
      const catName = (track.cat_name || track.category_name || '').toLowerCase();
      const isAdvert = ['advert','promo','jingle','commercials','adverts'].some(t => catType === t || catName === t);
      if (!isAdvert) return;
    }
    const now = new Date();
    const air_date = localDateStr(now);
    const air_time = now.toTimeString().slice(0,8);
    const ref = track.id ? `DFM-${track.id}` : null;
    // Match by material_ref (audio_cut) first, then fall back to title match
    const existing = ref
      ? tdb.prepare("SELECT id FROM schedule_slots WHERE air_date=? AND audio_cut=? AND status='scheduled' LIMIT 1").get(air_date, ref)
      : tdb.prepare("SELECT id FROM schedule_slots WHERE air_date=? AND material_title=? AND status='scheduled' LIMIT 1").get(air_date, track.title||'Unknown');
    if (existing) {
      tdb.prepare("UPDATE schedule_slots SET status='aired', air_time=? WHERE id=?").run(air_time, existing.id);
    } else {
      // Try to find the client from a matching active order (check audio_cut, material_ref, and title)
      const orderMatch = tdb.prepare(
        "SELECT client_id FROM orders WHERE (audio_cut=? OR material_ref=? OR material_title=?) ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id DESC LIMIT 1"
      ).get(ref||'', ref||'', track.title||'Unknown');
      const clientId = orderMatch?.client_id || null;
      tdb.prepare('INSERT INTO schedule_slots (air_date,air_time,duration,material_title,material_ref,audio_cut,client_id,status,notes) VALUES (?,?,?,?,?,?,?,?,?)').run(
        air_date, air_time, Math.round(track.duration||30),
        track.title||'Unknown', ref, ref, clientId, 'aired',
        'Auto-logged from Henolla Playout'
      );
    }
  } catch(e) { console.error('[traffic-log] ERROR:', e.message); }
}

// ── Global now-playing state (for clock page) ─────────────────
let _globalNowPlaying = null;
let _globalIsPlaying  = false;
app.get('/api/now-playing', (req, res) => {
  res.json({ nowPlaying: _globalNowPlaying, isPlaying: _globalIsPlaying });
});

// ── Socket.io — per-client independent playout state ─────────
// Each connected machine manages its own playback independently.
// No playout state is broadcast to other clients.
const clientStates = new Map();

io.on('connection', socket => {
  console.log('Connected:', socket.id);
  const initState = { nowPlaying:null, queue:[], isPlaying:false, currentTime:0, volume:1, updatedAt:Date.now() };
  clientStates.set(socket.id, initState);
  socket.emit('playout-state', initState);

  function getState() { return clientStates.get(socket.id) || initState; }
  function setState(patch) {
    const s = { ...getState(), ...patch, updatedAt:Date.now() };
    clientStates.set(socket.id, s);
    socket.emit('playout-state', s);
  }

  socket.on('playout-play', data => {
    setState({ ...data, isPlaying:true });
    _globalNowPlaying = data.nowPlaying || null;
    _globalIsPlaying  = true;
    if (data.nowPlaying?.id) {
      db.run('UPDATE tracks SET play_count=play_count+1 WHERE id=?', [data.nowPlaying.id]);
      logAdvertToTrafficManager(data.nowPlaying);
    }
  });
  socket.on('playout-pause', ()    => { setState({ isPlaying:false }); _globalIsPlaying = false; });
  socket.on('playout-stop',  ()    => { setState({ isPlaying:false, nowPlaying:null, currentTime:0 }); _globalNowPlaying = null; _globalIsPlaying = false; });
  socket.on('playout-queue', queue => setState({ queue }));
  socket.on('playout-time',  time  => { getState().currentTime = time; });
  socket.on('cart-play',     data  => socket.emit('cart-play', data));
  socket.on('disconnect',    ()    => { clientStates.delete(socket.id); console.log('Disconnected:', socket.id); });
});

// ── Find available port (avoids conflicts on Windows) ─────────
function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const net  = require('net');
    const test = net.createServer();
    test.listen(startPort, '0.0.0.0', () => {
      const port = test.address().port;
      test.close(() => resolve(port));
    });
    test.on('error', () => resolve(findAvailablePort(startPort + 1)));
  });
}


// ── Shared push secret (stored in traffic DB, auto-generated on first run) ────
function getPushSecret() {
  try {
    let s = tdb.prepare("SELECT value FROM station_settings WHERE key='push_secret'").get()?.value;
    if (!s) {
      s = require('crypto').randomBytes(32).toString('hex');
      tdb.prepare("INSERT OR REPLACE INTO station_settings (key,value) VALUES ('push_secret',?)").run(s);
    }
    return s;
  } catch { return null; }
}

function pushAuth(req, res, next) {
  const secret = getPushSecret();
  // If no secret is configured yet, allow through (first-boot backwards compat)
  if (!secret) return next();
  const sent = req.headers['x-push-secret'] || req.query.secret;
  if (sent !== secret) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ══════════════════════════════════════════════════════════════
// ── Receive pushed traffic from Traffic Manager ───────────────────────────────
app.post('/api/push/traffic', pushAuth, (req, res) => {
  try {
    const { action, slot, id } = req.body;
    if (action === 'insert' && slot) {
      tdb.prepare(
        "INSERT OR IGNORE INTO schedule_slots (remote_id,order_id,order_item_id,client_id,air_date,air_time,duration,material_title,material_ref,status,notes,day_part,break_position,audio_cut,break_number,product_type,remote_synced) " +
        "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)"
      ).run(slot.id||null, slot.order_id||null, slot.order_item_id||null, slot.client_id||null,
        slot.air_date, slot.air_time, slot.duration||30, slot.material_title||null,
        slot.material_ref||null, slot.status||'scheduled', slot.notes||null,
        slot.day_part||null, slot.break_position||'any', slot.audio_cut||null,
        slot.break_number||1, slot.product_type||null);
    } else if (action === 'update' && slot) {
      // Look up by remote_id (TM's slot id) — that's how locally-stored slots track TM identity
      const exists = tdb.prepare('SELECT id FROM schedule_slots WHERE remote_id=?').get(slot.id);
      if (exists) {
        tdb.prepare(
          "UPDATE schedule_slots SET air_date=?,air_time=?,duration=?,material_title=?,material_ref=?,status=?,notes=?,day_part=?,break_position=?,audio_cut=?,break_number=?,product_type=?,remote_synced=1 WHERE remote_id=?"
        ).run(slot.air_date, slot.air_time, slot.duration||30, slot.material_title||null,
          slot.material_ref||null, slot.status||'scheduled', slot.notes||null,
          slot.day_part||null, slot.break_position||'any', slot.audio_cut||null,
          slot.break_number||1, slot.product_type||null, slot.id);
      } else {
        tdb.prepare(
          "INSERT OR IGNORE INTO schedule_slots (remote_id,order_id,order_item_id,client_id,air_date,air_time,duration,material_title,material_ref,status,notes,day_part,break_position,audio_cut,break_number,product_type,remote_synced) " +
          "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)"
        ).run(slot.id, slot.order_id||null, slot.order_item_id||null, slot.client_id||null,
          slot.air_date, slot.air_time, slot.duration||30, slot.material_title||null,
          slot.material_ref||null, slot.status||'scheduled', slot.notes||null,
          slot.day_part||null, slot.break_position||'any', slot.audio_cut||null,
          slot.break_number||1, slot.product_type||null);
      }
    } else if (action === 'delete' && id) {
      tdb.prepare('DELETE FROM schedule_slots WHERE id=? OR remote_id=?').run(id, id);
    } else if (action === 'aired') {
      // Another playout already played this slot — mark it aired locally so we skip it
      let _airedChanged = 0;
      if (id) {
        const _r = tdb.prepare("UPDATE schedule_slots SET status='aired' WHERE (id=? OR remote_id=?) AND status='scheduled'").run(id, id);
        _airedChanged = _r.changes;
      }
      // Fallback for virtual order-generated slots (id=null or no matching row):
      // Try title+date+time (exact minute), then title+date (any time within ±5 min),
      // then insert an explicit aired row so ordersToSlots() dedup suppresses the virtual slot.
      if (!_airedChanged && slot?.material_title && slot?.air_date) {
        if (slot.air_time) {
          const _r2 = tdb.prepare("UPDATE schedule_slots SET status='aired' WHERE material_title=? AND air_date=? AND substr(air_time,1,5)=? AND status='scheduled'").run(slot.material_title, slot.air_date, slot.air_time.slice(0,5));
          _airedChanged = _r2.changes;
        }
        if (!_airedChanged) {
          // Broader match: same title+date, closest scheduled slot within 10 minutes
          const nearby = tdb.prepare(
            "SELECT id, air_time FROM schedule_slots WHERE material_title=? AND air_date=? AND status='scheduled' " +
            "ORDER BY ABS((CAST(SUBSTR(COALESCE(air_time,'00:00'),1,2) AS INTEGER)*60+CAST(SUBSTR(COALESCE(air_time,'00:00'),4,2) AS INTEGER)) - " +
            "(CAST(SUBSTR(?,1,2) AS INTEGER)*60+CAST(SUBSTR(?,4,2) AS INTEGER))) LIMIT 1"
          ).get(slot.material_title, slot.air_date, (slot.air_time||'00:00').slice(0,5), (slot.air_time||'00:00').slice(0,5));
          if (nearby) {
            tdb.prepare("UPDATE schedule_slots SET status='aired' WHERE id=?").run(nearby.id);
            _airedChanged = 1;
          }
        }
        if (!_airedChanged) {
          // No existing row — insert an aired row using the slot's scheduled time so ordersToSlots() dedup matches
          try {
            tdb.prepare(
              "INSERT INTO schedule_slots (air_date,air_time,duration,material_title,status,notes,remote_synced) VALUES (?,?,?,?,?,?,1)"
            ).run(slot.air_date, slot.air_time||null, 30, slot.material_title, 'aired', 'Played on another playout');
          } catch(e2) { /* ignore */ }
        }
      }
    }
    io.emit('traffic-synced', { pushed: true, action });
    res.json({ ok: true });
  } catch(e) {
    console.error('[push/traffic]', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/push/traffic/status', (req, res) => {
  res.json({ ok: true, server: 'Henolla Playout Central Server' });
});

// REMOTE TRAFFIC SYNC
// Polls a remote traffic manager and replicates its schedule
// into the local tdb so both playout PCs stay in sync.
// ══════════════════════════════════════════════════════════════
let remoteSyncTimer  = null;
let remoteSyncStatus = { ok: false, lastSync: null, error: null, url: '' };

function getRemoteTrafficUrl() {
  try {
    let v = (tdb.prepare("SELECT value FROM station_settings WHERE key='remote_traffic_url'").get()?.value || '').trim();
    if (v && !/^https?:\/\//i.test(v)) v = 'http://' + v;
    return v.replace(/\/$/, '');
  } catch { return ''; }
}

// ── Peer Playout Direct Push ──────────────────────────────────────────────────
// Push aired-slot notifications directly to sibling playout PCs,
// completely bypassing the Traffic Manager so removal works even when TM is offline.
function getPeerPlayoutUrls() {
  try {
    const raw = (tdb.prepare("SELECT value FROM station_settings WHERE key='peer_playout_urls'").get()?.value || '').trim();
    return raw.split('\n').map(u => u.trim()).filter(Boolean).map(u => {
      if (!/^https?:\/\//i.test(u)) u = 'http://' + u;
      return u.replace(/\/$/, '');
    });
  } catch { return []; }
}

function _pushAiredToPeers(slotId, materialTitle, airDate, airTime) {
  const peers = getPeerPlayoutUrls();
  if (!peers.length) return;
  const payload = JSON.stringify({ action: 'aired', id: slotId || null, slot: { material_title: materialTitle, air_date: airDate, air_time: airTime || null } });
  for (const peerUrl of peers) {
    try {
      const parsed = new (require('url').URL)(peerUrl + '/api/push/traffic');
      const opts = {
        hostname: parsed.hostname, port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), 'X-Push-Secret': getPushSecret() || '' }
      };
      const mod = parsed.protocol === 'https:' ? require('https') : http;
      const r = mod.request(opts, res => res.resume());
      r.on('error', e => console.warn('[peer-push] Failed to notify', peerUrl, e.message));
      r.write(payload); r.end();
      console.log('[peer-push] Notified peer:', peerUrl, '| slot:', materialTitle);
    } catch(e) { console.warn('[peer-push] Error:', e.message); }
  }
}

async function doRemoteSync() {
  const url = getRemoteTrafficUrl();
  if (!url) return;
  remoteSyncStatus.url = url;

  try {
    const today = localDateStr();
    const toDt  = new Date(today + 'T12:00:00'); toDt.setDate(toDt.getDate()+14);
    const to    = toDt.toISOString().slice(0,10);

    const fullUrl = url.replace(/\/$/, '') + `/api/public/sync?from=${today}&to=${to}`;
    const data = await new Promise((resolve, reject) => {
      const mod = fullUrl.startsWith('https') ? require('https') : http;
      const req = mod.get(fullUrl, { timeout: 8000 }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch(e) { reject(new Error('Invalid JSON from traffic manager')); }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout connecting to traffic manager')); });
    });

    // Sync schedule_slots: explicit check-then-insert/update by remote_id.
    // Avoids relying on ON CONFLICT which requires the unique index to exist.
    // Slots already in DB are updated; new ones are inserted. Nothing is deleted.
    const stmtCheck  = tdb.prepare("SELECT id FROM schedule_slots WHERE remote_id=?");
    const stmtInsert = tdb.prepare(
      "INSERT INTO schedule_slots (remote_id,order_id,order_item_id,client_id,air_date,air_time,duration,material_title,material_ref,status,notes,day_part,break_position,audio_cut,break_number,product_type,remote_synced) " +
      "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)"
    );
    const stmtUpdate = tdb.prepare(
      "UPDATE schedule_slots SET order_id=?,order_item_id=?,client_id=?,air_date=?,air_time=?,duration=?,material_title=?,material_ref=?," +
      // Protect any locally-aired slot (played here or marked aired by a peer) — never let TM's stale 'scheduled'
      // status overwrite it. Only use TM's status when the slot hasn't been played locally.
      "status=CASE WHEN status='aired' THEN 'aired' WHEN ?='scheduled' THEN 'scheduled' ELSE ? END," +
      "notes=?,day_part=?,break_position=?,audio_cut=?,break_number=?,product_type=?,remote_synced=1 WHERE remote_id=?"
    );
    const syncSlots = tdb.transaction(() => {
      for (const s of (data.slots || [])) {
        if (!s.id) continue;
        const existing = stmtCheck.get(s.id);
        if (existing) {
          const tmStatus = s.status||'scheduled';
          stmtUpdate.run(s.order_id||null, s.order_item_id||null, s.client_id||null,
            s.air_date, s.air_time, s.duration||30, s.material_title||null, s.material_ref||null,
            tmStatus, tmStatus, s.notes||null, s.day_part||null, s.break_position||'any',
            s.audio_cut||null, s.break_number||1, s.product_type||null,
            s.id);
        } else {
          // Before inserting a new scheduled row, check if this slot was already played locally
          // (auto-inserted aired row with remote_id=NULL). If so, link it rather than creating
          // a duplicate scheduled row that would make the slot reappear in the rundown.
          const airedRow = tdb.prepare(
            "SELECT id FROM schedule_slots WHERE material_title=? AND air_date=? AND status='aired' AND remote_id IS NULL " +
            "AND substr(COALESCE(air_time,'00:00'),1,5)=substr(COALESCE(?,'00:00'),1,5)"
          ).get(s.material_title||null, s.air_date, s.air_time||'');
          if (airedRow) {
            // Link the existing aired row to TM's remote_id so future syncs find it and keep it aired
            tdb.prepare("UPDATE schedule_slots SET remote_id=?, remote_synced=1 WHERE id=?").run(s.id, airedRow.id);
          } else {
            stmtInsert.run(s.id, s.order_id||null, s.order_item_id||null, s.client_id||null,
              s.air_date, s.air_time, s.duration||30, s.material_title||null, s.material_ref||null,
              s.status||'scheduled', s.notes||null, s.day_part||null, s.break_position||'any',
              s.audio_cut||null, s.break_number||1, s.product_type||null);
          }
        }
      }
    });
    syncSlots();

    // Remove slots in this window that were deleted on the traffic manager
    const remoteIds = new Set((data.slots||[]).filter(s => s.id).map(s => s.id));
    const localSynced = tdb.prepare(
      "SELECT id, remote_id FROM schedule_slots WHERE remote_synced=1 AND remote_id IS NOT NULL AND air_date>=? AND air_date<=?"
    ).all(today, to);
    const toDelete = localSynced.filter(r => !remoteIds.has(r.remote_id));
    if (toDelete.length > 0) {
      const stmtDel = tdb.prepare("DELETE FROM schedule_slots WHERE id=?");
      tdb.transaction(() => { toDelete.forEach(r => stmtDel.run(r.id)); })();
      console.log(`[remote-sync] Removed ${toDelete.length} deleted slot(s)`);
    }

    // Sync active orders (upsert)
    const syncOrders = tdb.transaction(() => {
      for (const o of (data.orders || [])) {
        tdb.prepare(
          "INSERT OR REPLACE INTO orders (id,order_number,client_id,start_date,end_date,total_spots,status,notes,week_pattern,day_parts,material_title,audio_cut,material_ref,product_type,spots_per_day,day_schedule,specific_dates,schedule_mode) " +
          "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        ).run(o.id, o.order_number||('ORD-'+o.id), o.client_id||null,
          o.start_date, o.end_date, o.total_spots||0, o.status||'active',
          o.notes||null, o.week_pattern||'all', o.day_parts||'[]',
          o.material_title||null, o.audio_cut||null, o.material_ref||null, o.product_type||null,
          o.spots_per_day != null ? parseInt(o.spots_per_day) : null,
          o.day_schedule ? (typeof o.day_schedule==='string' ? o.day_schedule : JSON.stringify(o.day_schedule)) : null,
          o.specific_dates ? (typeof o.specific_dates==='string' ? o.specific_dates : JSON.stringify(o.specific_dates)) : null,
          o.schedule_mode || 'days');
      }
    });
    syncOrders();

    // Sync clients (upsert name)
    const syncClients = tdb.transaction(() => {
      for (const c of (data.clients || [])) {
        tdb.prepare("INSERT OR REPLACE INTO clients (id,name,active) VALUES (?,?,1)").run(c.id, c.name);
      }
    });
    syncClients();

    // ── Auto-cache audio files from Traffic Manager ──────────────────────────
    // For every slot that has a remote audio_cut path, download and store the
    // file in the local library so adverts still play when the traffic PC is off.
    const uniqueAudioCuts = [...new Set(
      (data.slots || [])
        .filter(s => s.audio_cut && s.audio_cut.startsWith('/audio-files/'))
        .map(s => s.audio_cut)
    )];
    if (uniqueAudioCuts.length > 0) {
      const advertCat = db.get("SELECT id FROM categories WHERE type='advert' OR name LIKE '%dvert%' ORDER BY id LIMIT 1");
      const advertCatId = advertCat ? advertCat.id : null;
      for (const audioCut of uniqueAudioCuts) {
        const remoteFilename = path.basename(audioCut);
        // Skip if already cached from a previous sync
        const already = db.get("SELECT id FROM tracks WHERE uploaded_by='TrafficSync' AND filename LIKE ?",
          ['%_' + remoteFilename]);
        if (already) continue;
        try {
          const fileUrl = url.replace(/\/$/, '') + audioCut;
          const fileData = await new Promise((resolve, reject) => {
            const mod = fileUrl.startsWith('https') ? require('https') : http;
            const req = mod.get(fileUrl, { timeout: 60000 }, (res) => {
              if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`HTTP ${res.statusCode} for ${audioCut}`));
                return;
              }
              const chunks = [];
              res.on('data', c => chunks.push(c));
              res.on('end', () => resolve(Buffer.concat(chunks)));
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('Download timed out')); });
          });
          const destDir = path.join(getUploadsBase(), advertCatId ? String(advertCatId) : 'advert');
          fs.mkdirSync(destDir, { recursive: true });
          const localFilename = Date.now() + '_' + remoteFilename;
          const localPath    = path.join(destDir, localFilename);
          await fs.promises.writeFile(localPath, fileData);
          const urlPath  = `/audio/${advertCatId || 'advert'}/${localFilename}`;
          const fmt      = path.extname(remoteFilename).slice(1).toUpperCase();
          const matchSlot = (data.slots || []).find(s => s.audio_cut === audioCut);
          const title    = matchSlot?.material_title || path.basename(remoteFilename, path.extname(remoteFilename));
          const artist   = matchSlot?.client_name || '';
          const dur      = matchSlot?.duration || 0;
          const insertResult = db.run(
            `INSERT INTO tracks (title,artist,album,category_id,filename,filepath,url_path,duration,format,size,uploaded_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [title, artist, '', advertCatId, localFilename, localPath, urlPath, dur, fmt, fileData.length, 'TrafficSync']
          );
          // Notify all connected playout clients so their tracks array updates immediately
          // — this means _resolveSlotTrack() will find the cached track even if the
          //   playout was already running when the file was downloaded.
          const newTrack = db.get(
            `SELECT t.*, COALESCE(t.artwork_path,'') as artwork_path, COALESCE(t.sample_rate,0) as sample_rate,
             c.name as cat_name, c.color as cat_color, c.icon as cat_icon, c.type as cat_type
             FROM tracks t LEFT JOIN categories c ON t.category_id=c.id WHERE t.id=?`,
            [insertResult.lastInsertRowid]
          );
          if (newTrack) io.emit('track-added', newTrack);
          console.log(`[remote-sync] Cached advert audio: ${remoteFilename}`);
        } catch (dlErr) {
          console.warn(`[remote-sync] Could not cache ${audioCut}:`, dlErr.message);
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Re-push locally-aired slots that TM still has as scheduled ────────────
    // Self-heals failed initial mark-aired pushes (e.g. if TM was briefly offline)
    const tmScheduledIds = new Set(
      (data.slots||[]).filter(s => s.id && s.status === 'scheduled').map(s => s.id)
    );
    if (tmScheduledIds.size > 0) {
      const localAired = tdb.prepare(
        "SELECT remote_id, material_title, air_date, air_time FROM schedule_slots " +
        "WHERE status='aired' AND remote_id IS NOT NULL AND played_at IS NOT NULL AND air_date=?"
      ).all(today);
      const toRepush = localAired.filter(s => tmScheduledIds.has(s.remote_id));
      for (const s of toRepush) {
        const rpBody = JSON.stringify({ slot_id: s.remote_id, material_title: s.material_title, air_date: s.air_date, air_time: (s.air_time||'').slice(0,5) });
        try {
          const parsed2 = new (require('url').URL)(url.replace(/\/$/, '') + '/api/public/mark-aired');
          const mod2 = parsed2.protocol === 'https:' ? require('https') : http;
          const rp = mod2.request({
            hostname: parsed2.hostname, port: parsed2.port || (parsed2.protocol === 'https:' ? 443 : 80),
            path: parsed2.pathname, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(rpBody) }
          });
          rp.on('error', e => console.warn('[remote-sync] re-push failed:', e.message));
          rp.write(rpBody); rp.end();
          console.log(`[remote-sync] Re-pushed aired slot ${s.remote_id} (${s.material_title}) to TM`);
        } catch(e2) { console.warn('[remote-sync] re-push error:', e2.message); }
      }
    }

    const slotCount = (data.slots||[]).length;
    const orderCount = (data.orders||[]).length;
    remoteSyncStatus = { ok: true, lastSync: new Date().toISOString(), error: null, url, slotCount, orderCount };
    console.log(`[remote-sync] OK — ${slotCount} slots, ${orderCount} orders synced from ${url}`);

    // Notify all connected clients to refresh their traffic display
    io.emit('traffic-synced', { synced_at: remoteSyncStatus.lastSync });

  } catch(err) {
    let userMsg = err.message;
    if (err.code === 'ECONNREFUSED')
      userMsg = `Cannot connect to Traffic Manager at ${url} — make sure the app is running and Windows Firewall allows port 4000 inbound`;
    else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT')
      userMsg = `Traffic Manager timed out (${url}) — check the IP address and network connection`;
    else if (err.code === 'ENOTFOUND')
      userMsg = `Cannot resolve address ${url} — check the IP address`;
    remoteSyncStatus = { ok: false, lastSync: remoteSyncStatus.lastSync, error: userMsg, url };
    console.warn('[remote-sync] FAILED:', err.message);
  }
}

function startRemoteSync(intervalMs = 5000) {
  if (remoteSyncTimer) clearInterval(remoteSyncTimer);
  const url = getRemoteTrafficUrl();
  if (!url) return;
  console.log('[remote-sync] Starting sync from:', url);
  doRemoteSync(); // immediate first sync
  remoteSyncTimer = setInterval(doRemoteSync, intervalMs);
}

function restartRemoteSync() {
  if (remoteSyncTimer) { clearInterval(remoteSyncTimer); remoteSyncTimer = null; }
  startRemoteSync();
}

// Settings endpoints for remote traffic URL
app.get('/api/remote-traffic', (req, res) => {
  res.json({ url: getRemoteTrafficUrl(), status: remoteSyncStatus });
});

app.post('/api/remote-traffic', (req, res) => {
  const url = (req.body.url || '').trim();
  try {
    tdb.prepare("INSERT OR REPLACE INTO station_settings (key,value) VALUES ('remote_traffic_url',?)").run(url);
    restartRemoteSync();
    res.json({ ok: true, url });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Peer Playout URLs — direct aired-slot push (no TM dependency)
app.get('/api/peer-playouts', (req, res) => {
  res.json({ urls: getPeerPlayoutUrls().join('\n') });
});
app.post('/api/peer-playouts', (req, res) => {
  const raw = (req.body.urls || '').trim();
  try {
    tdb.prepare("INSERT OR REPLACE INTO station_settings (key,value) VALUES ('peer_playout_urls',?)").run(raw);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/remote-traffic/test', async (req, res) => {
  const url = (req.body.url || '').trim();
  if (!url) return res.json({ ok: false, error: 'No URL provided' });
  try {
    const testUrl = url.replace(/\/$/, '') + '/api/public/sync?from=2000-01-01&to=2000-01-01';
    await new Promise((resolve, reject) => {
      const mod = testUrl.startsWith('https') ? require('https') : http;
      const r = mod.get(testUrl, { timeout: 5000 }, (resp) => {
        let b = ''; resp.on('data', c => b += c);
        resp.on('end', () => { try { JSON.parse(b); resolve(); } catch { reject(new Error('Invalid response')); } });
      });
      r.on('error', reject);
      r.on('timeout', () => { r.destroy(); reject(new Error('Connection timeout')); });
    });
    res.json({ ok: true });
  } catch(e) {
    res.json({ ok: false, error: e.message });
  }
});

app.post('/api/remote-traffic/sync-now', async (req, res) => {
  await doRemoteSync();
  res.json(remoteSyncStatus);
});

// ── Henolla FM Media Server ───────────────────────────────────
function getMediaServerUrl() {
  try {
    const row = db.get("SELECT value FROM settings WHERE key='media_server_url'");
    return row ? (row.value || '') : '';
  } catch { return ''; }
}

app.get('/api/media-server', (req, res) => {
  res.json({ url: getMediaServerUrl() });
});

app.post('/api/media-server', (req, res) => {
  const url = (req.body.url || '').trim();
  db.run("INSERT OR REPLACE INTO settings (key,value) VALUES ('media_server_url',?)", [url]);
  res.json({ ok: true, url });
});

app.post('/api/media-server/test', async (req, res) => {
  const url = (req.body.url || '').trim();
  if (!url) return res.json({ ok: false, error: 'No URL provided' });
  try {
    const testUrl = url.replace(/\/$/, '') + '/api/public/server-info';
    await new Promise((resolve, reject) => {
      const mod = testUrl.startsWith('https') ? require('https') : http;
      const r = mod.get(testUrl, { timeout: 5000 }, (resp) => {
        let b = ''; resp.on('data', c => b += c);
        resp.on('end', () => { try { JSON.parse(b); resolve(); } catch { reject(new Error('Invalid response')); } });
      });
      r.on('error', reject);
      r.on('timeout', () => { r.destroy(); reject(new Error('Connection timeout')); });
    });
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false, error: e.message }); }
});

app.get('/api/media-server/categories', async (req, res) => {
  const url = getMediaServerUrl();
  if (!url) return res.json([]);
  try {
    const fullUrl = url.replace(/\/$/, '') + '/api/public/categories';
    const data = await new Promise((resolve, reject) => {
      const mod = fullUrl.startsWith('https') ? require('https') : http;
      const r = mod.get(fullUrl, { timeout: 8000 }, (resp) => {
        let b = ''; resp.on('data', c => b += c);
        resp.on('end', () => { try { resolve(JSON.parse(b)); } catch { reject(new Error('Invalid response')); } });
      });
      r.on('error', reject);
      r.on('timeout', () => { r.destroy(); reject(new Error('Timeout')); });
    });
    res.json(data);
  } catch(e) { res.status(502).json({ error: e.message }); }
});

app.get('/api/media-server/tracks', async (req, res) => {
  const url = getMediaServerUrl();
  if (!url) return res.json([]);
  try {
    const params = new URLSearchParams();
    if (req.query.category_id) params.set('category_id', req.query.category_id);
    if (req.query.q) params.set('q', req.query.q);
    const fullUrl = url.replace(/\/$/, '') + '/api/public/tracks?' + params.toString();
    const data = await new Promise((resolve, reject) => {
      const mod = fullUrl.startsWith('https') ? require('https') : http;
      const r = mod.get(fullUrl, { timeout: 8000 }, (resp) => {
        let b = ''; resp.on('data', c => b += c);
        resp.on('end', () => { try { resolve(JSON.parse(b)); } catch { reject(new Error('Invalid response')); } });
      });
      r.on('error', reject);
      r.on('timeout', () => { r.destroy(); reject(new Error('Timeout')); });
    });
    res.json(data);
  } catch(e) { res.status(502).json({ error: e.message }); }
});

app.get('/api/media-server/events', (req, res) => {
  const url = getMediaServerUrl();
  if (!url) { res.status(503).end(); return; }
  const eventsUrl = url.replace(/\/$/, '') + '/api/public/events';
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const mod = eventsUrl.startsWith('https') ? require('https') : http;
  const upstream = mod.get(eventsUrl, (upstream) => {
    upstream.on('data', chunk => { try { res.write(chunk); } catch {} });
    upstream.on('end', () => res.end());
    upstream.on('error', () => res.end());
  });
  upstream.on('error', () => res.end());
  req.on('close', () => upstream.destroy());
});

// ── Public API (exposed so peer Playout instances can use this as a media server) ──
app.get('/api/public/server-info', (req, res) => {
  res.json({ name: 'Henolla Playout', version: '1.1.3' });
});

app.get('/api/public/categories', (req, res) => {
  try {
    res.json(db.query('SELECT id, name, type, color, icon, parent_id FROM categories ORDER BY position, name'));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/public/tracks', (req, res) => {
  try {
    let sql = T_SEL;
    const params = [];
    if (req.query.category_id) { sql += ' WHERE t.category_id=?'; params.push(req.query.category_id); }
    if (req.query.q) {
      sql += params.length ? ' AND' : ' WHERE';
      sql += ' (t.title LIKE ? OR t.artist LIKE ?)';
      params.push('%' + req.query.q + '%', '%' + req.query.q + '%');
    }
    sql += ' ORDER BY t.title';
    res.json(db.query(sql, params));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/public/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const hb = setInterval(() => { try { res.write(':heartbeat\n\n'); } catch { clearInterval(hb); } }, 25000);
  req.on('close', () => clearInterval(hb));
});

// ── Boot ──────────────────────────────────────────────────────
// ── TrafficSync cache cleanup ─────────────────────────────────────────────────
// Deletes locally-cached advert audio (uploaded_by='TrafficSync') once all
// scheduled slots that reference the file have aired and no active orders
// still need it. Called on startup and after each slot is marked aired.
function cleanupStaleTrafficSyncTracks() {
  try {
    const syncTracks = db.query("SELECT id, filename, filepath FROM tracks WHERE uploaded_by='TrafficSync'");
    for (const track of syncTracks) {
      // Reconstruct the original audio_cut path from the local filename (strip timestamp prefix)
      const remoteFilename = track.filename.replace(/^\d+_/, '');
      const audioCut = '/audio-files/' + remoteFilename;

      // Any upcoming non-aired scheduled slots still needing this audio?
      const upcomingSlots = tdb.prepare(
        "SELECT COUNT(*) as c FROM schedule_slots WHERE audio_cut=? AND status='scheduled' AND air_date >= date('now')"
      ).get(audioCut);

      // Any active recurring orders still needing this audio?
      const activeOrders = tdb.prepare(
        "SELECT COUNT(*) as c FROM orders WHERE audio_cut=? AND status='active'"
      ).get(audioCut);

      if ((upcomingSlots?.c || 0) === 0 && (activeOrders?.c || 0) === 0) {
        try { if (fs.existsSync(track.filepath)) fs.unlinkSync(track.filepath); } catch (e) { console.warn('[cleanup] Could not delete file:', e.message); }
        db.run("DELETE FROM tracks WHERE id=?", [track.id]);
        io.emit('track-deleted', { id: track.id });
        console.log(`[cleanup] Removed stale TrafficSync track: ${track.filename}`);
      }
    }
  } catch (e) {
    console.warn('[cleanup] cleanupStaleTrafficSyncTracks error:', e.message);
  }
}

const portReady = db.init().then(() => tdb.init()).then(async () => {
  const actualPort = await findAvailablePort(PORT);
  process.env.DIAMOND_ACTUAL_PORT = String(actualPort);
  return new Promise((resolve) => {
    server.listen(actualPort, '0.0.0.0', () => {
      let localIP = 'localhost';
      for (const nets of Object.values(os.networkInterfaces())) {
        for (const net of nets) {
          if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
            localIP = net.address; break;
          }
        }
      }
      console.log('\n Henolla Playout Server');
      console.log(`   Local:   http://localhost:${actualPort}`);
      console.log(`   Network: http://${localIP}:${actualPort}`);
      console.log(`   Other PCs connect to: http://${localIP}:${actualPort}\n`);
      // Start remote traffic sync if configured (must be inside listen callback — code after `return new Promise` is unreachable)
      setTimeout(startRemoteSync, 2000);
      // Clean up any stale TrafficSync advert audio left over from previous sessions/days
      setTimeout(cleanupStaleTrafficSyncTracks, 5000);
      resolve(actualPort);
    });
  });
});

module.exports.portReady = portReady;

// ══════════════════════════════════════════════════════════════
// ── USB DONGLE LICENSE SYSTEM ─────────────────────────────────
// ══════════════════════════════════════════════════════════════
const { exec: _execLic } = require('child_process');
let _validateKey, _saveLicense, _checkLicenseFile;
try { ({ validateKey: _validateKey, saveLicense: _saveLicense, checkLicense: _checkLicenseFile } = require('./license')); } catch (_e) {}
const _DEMO_TRACK_LIMIT = 20; // max tracks allowed in demo mode
const _PRODUCT_CODE = 'HNPL';

// Read all removable USB drives currently connected (Windows only; returns [] on other OSes)
function _getUSBDrives() {
  return new Promise(resolve => {
    if (process.platform !== 'win32') return resolve([]);
    _execLic(
      'powershell -NoProfile -Command "Get-WmiObject Win32_LogicalDisk | Where-Object {($_.DriveType -eq 2 -or $_.DriveType -eq 3) -and $_.DeviceID -ne \'C:\'} | Select-Object DeviceID,VolumeSerialNumber | ConvertTo-Json"',
      { timeout: 5000 },
      (err, stdout) => {
        if (err || !stdout.trim()) return resolve([]);
        try {
          let data = JSON.parse(stdout.trim());
          if (!Array.isArray(data)) data = [data];
          resolve(
            data
              .map(d => ({ drive: d.DeviceID || '', serial: (d.VolumeSerialNumber || '').toUpperCase().trim() }))
              .filter(d => d.drive)
          );
        } catch { resolve([]); }
      }
    );
  });
}

// Check if any connected USB drive contains a valid onatham-license.json
async function _checkLicense() {
  if (!_checkLicenseFile) return { licensed: false, reason: 'license_module_missing' };
  try {
    const drives = await _getUSBDrives();
    for (const d of drives) {
      const drivePath = d.drive.endsWith('\\') ? d.drive : d.drive + '\\';
      try {
        const result = _checkLicenseFile(drivePath, _PRODUCT_CODE);
        if (result.licensed) {
          return { licensed: true, station: d.drive, drive: d.drive, expiry: result.expiry };
        }
      } catch (_) {}
    }
    return { licensed: false, reason: 'drive_not_found' };
  } catch (e) {
    return { licensed: false, reason: 'check_error', detail: e.message };
  }
}

// Global license state — updated every 30 s and on demand
let _licenseStatus = { licensed: false, reason: 'starting' };

async function _runLicenseCheck() {
  const prev = _licenseStatus.licensed;
  _licenseStatus = await _checkLicense();
  // Broadcast status to all connected clients when it changes
  if (_licenseStatus.licensed !== prev) {
    io.emit('license_status', _licenseStatus);
  }
}

// Run check every 30 seconds (detects drive removed while app is running)
setInterval(_runLicenseCheck, 30000);

// ── License API routes ─────────────────────────────────────────

// GET /api/license/status — current license state
app.get('/api/license/status', async (req, res) => {
  _licenseStatus = await _checkLicense();
  res.json(_licenseStatus);
});

// GET /api/license/drives — list USB drives currently plugged in
app.get('/api/license/drives', async (req, res) => {
  const drives = await _getUSBDrives();
  res.json({ drives });
});

// POST /api/license/register — validate key and write license file to USB drive
app.post('/api/license/register', (req, res) => {
  const { drive, key } = req.body;
  if (!drive) return res.status(400).json({ ok: false, error: 'drive required' });
  if (!key)   return res.status(400).json({ ok: false, error: 'license key required' });
  if (!_validateKey || !_saveLicense) return res.status(500).json({ ok: false, error: 'license module not loaded' });
  const result = _validateKey(_PRODUCT_CODE, key);
  if (!result.valid) return res.status(400).json({ ok: false, error: result.error });
  try {
    const drivePath = drive.endsWith('\\') ? drive : drive + '\\';
    _saveLicense(drivePath, key, result.expiry);
    _runLicenseCheck();
    res.json({ ok: true, expiry: result.expiry });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/license/demo-limit — how many tracks are allowed in demo mode
app.get('/api/license/demo-limit', (req, res) => {
  res.json({ limit: _DEMO_TRACK_LIMIT });
});

// ── Trial timer ───────────────────────────────────────────────────────────────
// Reset trial when a new major/minor version is installed (e.g. 1.5.x → 1.6.x)
const _APP_VERSION = '1.5';
try {
  const _verRow = db.get("SELECT value FROM settings WHERE key='installed_version'");
  if (!_verRow) {
    // First run ever — set version and start trial
    db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('installed_version', ?)", [_APP_VERSION]);
    db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('trial_start', ?)", [new Date().toISOString().split('T')[0]]);
  } else if (_verRow.value !== _APP_VERSION) {
    // New version installed — reset trial clock
    db.run("UPDATE settings SET value=? WHERE key='installed_version'", [_APP_VERSION]);
    db.run("UPDATE settings SET value=? WHERE key='trial_start'", [new Date().toISOString().split('T')[0]]);
  } else {
    // Same version — set trial_start only if not already set
    db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('trial_start', ?)", [new Date().toISOString().split('T')[0]]);
  }
} catch {}

app.get('/api/trial/status', (req, res) => {
  try {
    const row = db.get("SELECT value FROM settings WHERE key='trial_start'");
    if (!row) { res.json({ active: true, days_remaining: 30 }); return; }
    const diffDays = Math.floor((Date.now() - new Date(row.value).getTime()) / 86400000);
    const days_remaining = Math.max(0, 30 - diffDays);
    res.json({ active: days_remaining > 0, days_remaining, first_run: row.value });
  } catch (e) {
    res.json({ active: true, days_remaining: 30 });
  }
});

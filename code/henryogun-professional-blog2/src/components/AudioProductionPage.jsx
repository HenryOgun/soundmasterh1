import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Music, Video, Image, Plus, X, FileText, Lock, Loader, Trash2, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { client, writeClient } from '../sanityClient';
import SharePanel from './SharePanel';
import audioTracks from './audioData';

const ADMIN_PASSWORD = 'SoundMasterH1@Admin';
const SITE_URL = 'https://henryogun.com/projects/audio';

const TAG_OPTIONS = ['Station ID', 'Jingle', 'Song', 'Documentary', 'Audio Imaging', 'PSA', 'Promo Spot', 'Other'];

const QUERY = `*[_type == "audioProduction"] | order(_createdAt desc) {
  _id,
  title,
  tag,
  description,
  date,
  images[]{ asset->{ url } },
  audioFiles[]{ label, file{ asset->{ url, originalFilename } } },
  videoFiles[]{ label, file{ asset->{ url, originalFilename } } },
}`;

function formatDuration(secs) {
  if (!isFinite(secs) || isNaN(secs)) return '—';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function AudioCard({ track, activeId, onPlay }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (activeId !== track.id && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [activeId, track.id, playing]);

  const handlePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    onPlay(track.id);
    a.play();
    setPlaying(true);
  };

  const handlePause = () => { audioRef.current?.pause(); setPlaying(false); };

  const handleStop = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause(); a.currentTime = 0;
    setPlaying(false); setProgress(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.11)] transition-all duration-300 overflow-hidden">
      <audio ref={audioRef} src={track.src}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setProgress(e.target.currentTime / (e.target.duration || 1))}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <div className="h-1 bg-[#f4b940]" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900 leading-snug">{track.title}</h3>
          {track.tag && (
            <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">{track.tag}</span>
          )}
        </div>
        <div className="w-10 h-0.5 bg-[#f4b940] mb-3" />
        {track.description && <p className="text-xs text-gray-500 leading-relaxed mb-4">{track.description}</p>}
        <div className="flex items-center gap-3">
          <button onClick={playing ? handlePause : handlePlay}
            className="w-9 h-9 bg-[#f4b940] rounded-full flex items-center justify-center shrink-0 hover:bg-yellow-400 transition-colors">
            {playing ? <Pause size={14} className="text-black" /> : <Play size={14} className="text-black ml-0.5" />}
          </button>
          <button onClick={handleStop}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0 hover:bg-gray-200 transition-colors">
            <Square size={12} className="text-gray-600" />
          </button>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              if (audioRef.current) { audioRef.current.currentTime = ratio * audioRef.current.duration; setProgress(ratio); }
            }}>
            <div className="h-full bg-[#f4b940] rounded-full transition-all duration-100" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-xs text-gray-400 shrink-0 w-8 text-right">{formatDuration(duration)}</span>
        </div>
        {track.date && <p className="text-[10px] text-gray-300 mt-3">{track.date}</p>}
      </div>
    </div>
  );
}

function SanityEntryCard({ entry, isAdmin, onDelete, activeAudioId, onPlayAudio }) {
  const [expanded, setExpanded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Remove this entry?')) return;
    setDeleting(true);
    await onDelete(entry._id);
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.11)] transition-all duration-300 overflow-hidden">
      <div className="h-1 bg-[#f4b940]" />

      {entry.images?.length > 0 && (
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          <img src={entry.images[activeImg]?.asset?.url} alt="" className="w-full h-full object-cover" />
          {entry.images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {entry.images.map((_, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === activeImg ? 'bg-[#f4b940]' : 'bg-white/70'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900 leading-snug">{entry.title}</h3>
          {entry.tag && (
            <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">{entry.tag}</span>
          )}
        </div>
        <div className="w-10 h-0.5 bg-[#f4b940] mb-3" />

        {entry.description && (
          <div>
            <p className={`text-xs text-gray-500 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>{entry.description}</p>
            {entry.description.length > 100 && (
              <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs text-[#f4b940] font-semibold flex items-center gap-0.5 hover:underline">
                {expanded ? <><ChevronUp size={11} /> Less</> : <><ChevronDown size={11} /> More</>}
              </button>
            )}
          </div>
        )}

        {entry.audioFiles?.length > 0 && (
          <div className="mt-4 space-y-2">
            {entry.audioFiles.map((a, i) => {
              const audioId = `${entry._id}-audio-${i}`;
              return (
                <InlineAudioPlayer
                  key={i}
                  src={a.file?.asset?.url}
                  label={a.label || a.file?.asset?.originalFilename || `Track ${i + 1}`}
                  audioId={audioId}
                  activeId={activeAudioId}
                  onPlay={onPlayAudio}
                />
              );
            })}
          </div>
        )}

        {entry.videoFiles?.length > 0 && (
          <div className="mt-4 space-y-3">
            {entry.videoFiles.map((v, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-gray-500 mb-1 truncate">{v.label || v.file?.asset?.originalFilename || `Video ${i + 1}`}</p>
                <video src={v.file?.asset?.url} controls controlsList="nodownload" onContextMenu={e => e.preventDefault()} className="w-full rounded-lg max-h-48 object-cover" />
              </div>
            ))}
          </div>
        )}

        {entry.date && <p className="text-[10px] text-gray-300 mt-3">{entry.date}</p>}

        {isAdmin && (
          <button onClick={handleDelete} disabled={deleting}
            className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
            {deleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />} Remove
          </button>
        )}
      </div>
    </div>
  );
}

function InlineAudioPlayer({ src, label, audioId, activeId, onPlay }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (activeId !== audioId && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [activeId, audioId, playing]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { onPlay(audioId); audioRef.current.play(); setPlaying(true); }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause(); audioRef.current.currentTime = 0;
    setPlaying(false); setProgress(0);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <button onClick={toggle} className="w-7 h-7 bg-[#f4b940] rounded-full flex items-center justify-center shrink-0 hover:bg-yellow-400 transition-colors">
        {playing ? <Pause size={11} className="text-black" /> : <Play size={11} className="text-black ml-0.5" />}
      </button>
      <button onClick={handleStop} className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center shrink-0 hover:bg-gray-300 transition-colors">
        <Square size={10} className="text-gray-600" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-gray-700 truncate mb-1">{label}</p>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            if (audioRef.current) { audioRef.current.currentTime = ratio * audioRef.current.duration; setProgress(ratio); }
          }}>
          <div className="h-full bg-[#f4b940] rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <span className="text-[10px] text-gray-400 shrink-0">{formatDuration(duration)}</span>
      <audio ref={audioRef} src={src}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onTimeUpdate={e => setProgress(e.target.currentTime / (e.target.duration || 1))}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
    </div>
  );
}

export default function AudioProductionPage() {
  const [activeId, setActiveId] = useState(null);
  const [sanityEntries, setSanityEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('re_admin_audio') === '1');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', tag: 'Station ID', description: '', date: '' });
  const [socialCaption, setSocialCaption] = useState('');
  const [pendingImages, setPendingImages] = useState([]);
  const [pendingAudio, setPendingAudio] = useState([]);
  const [pendingVideos, setPendingVideos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedCaption, setSavedCaption] = useState(null);
  const titleClickCount = useRef(0);
  const titleClickTimer = useRef(null);

  const fetchEntries = useCallback(async () => {
    if (!client) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await client.fetch(QUERY);
      setSanityEntries(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleTitleClick = () => {
    titleClickCount.current += 1;
    clearTimeout(titleClickTimer.current);
    if (titleClickCount.current >= 3) {
      titleClickCount.current = 0;
      if (!isAdmin) setShowPasswordModal(true);
      else { sessionStorage.removeItem('re_admin_audio'); setIsAdmin(false); }
    } else {
      titleClickTimer.current = setTimeout(() => { titleClickCount.current = 0; }, 600);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('re_admin_audio', '1');
      setIsAdmin(true); setShowPasswordModal(false);
      setPasswordInput(''); setPasswordError('');
    } else { setPasswordError('Incorrect password.'); }
  };

  const handleFiles = (files, type) => {
    const arr = Array.from(files).map(f => ({ file: f, name: f.name, preview: type === 'image' ? URL.createObjectURL(f) : null }));
    if (type === 'image') setPendingImages(p => [...p, ...arr]);
    if (type === 'audio') setPendingAudio(p => [...p, ...arr]);
    if (type === 'video') setPendingVideos(p => [...p, ...arr]);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !writeClient) return;
    setSaving(true); setSaveError('');
    try {
      const imageRefs = await Promise.all(
        pendingImages.map(async ({ file }) => {
          const asset = await writeClient.assets.upload('image', file, { filename: file.name });
          return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
        })
      );
      const audioRefs = await Promise.all(
        pendingAudio.map(async ({ file }) => {
          const asset = await writeClient.assets.upload('file', file, { filename: file.name });
          return { _type: 'object', label: file.name, file: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } } };
        })
      );
      const videoRefs = await Promise.all(
        pendingVideos.map(async ({ file }) => {
          const asset = await writeClient.assets.upload('file', file, { filename: file.name });
          return { _type: 'object', label: file.name, file: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } } };
        })
      );

      await writeClient.create({
        _type: 'audioProduction',
        title: form.title.trim(),
        tag: form.tag,
        description: form.description.trim(),
        date: form.date.trim(),
        images: imageRefs,
        audioFiles: audioRefs,
        videoFiles: videoRefs,
      });

      const caption = socialCaption.trim() || `${form.title.trim()}${form.description.trim() ? ' — ' + form.description.trim().slice(0, 200) : ''}`;
      setSavedCaption(caption);
      setForm({ title: '', tag: 'Station ID', description: '', date: '' });
      setSocialCaption(''); setPendingImages([]); setPendingAudio([]); setPendingVideos([]);
      await fetchEntries();
    } catch (err) {
      console.error(err);
      setSaveError('Upload failed. Check your Sanity write token in .env');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!writeClient) return;
    await writeClient.delete(id);
    setSanityEntries(prev => prev.filter(e => e._id !== id));
  };

  return (
    <section className="relative py-24 min-h-screen overflow-hidden">
      <div className="absolute inset-0 scale-110"
        style={{ backgroundImage: 'url(/h2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(3px)' }} />
      <div className="absolute inset-0 bg-white/90" />

      {/* Password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => { setShowPasswordModal(false); setPasswordInput(''); setPasswordError(''); }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-10 bg-[#f4b940] rounded-lg flex items-center justify-center mb-4">
              <Lock size={18} className="text-black" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Admin Access</h3>
            <div className="w-10 h-0.5 bg-[#f4b940] mb-5" />
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input type="password" value={passwordInput} onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
                placeholder="Enter password" autoFocus
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              <button type="submit" className="w-full bg-[#f4b940] hover:bg-yellow-400 text-black text-sm font-bold py-2.5 rounded-lg transition-colors">Unlock</button>
            </form>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Sound, studio craft, and audio engineering</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 cursor-default select-none" onClick={handleTitleClick}>Audio Production</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto" />
          {isAdmin && <p className="mt-4 text-xs text-[#f4b940] font-semibold">Admin mode active — triple-click title to sign out</p>}
        </div>

        {/* Admin button */}
        {isAdmin && (
          <div className="flex justify-center mb-10">
            <button onClick={() => { setShowForm(!showForm); setSavedCaption(null); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#f4b940] text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors">
              <Plus size={16} />
              {showForm ? 'Cancel' : 'Add New Entry'}
            </button>
          </div>
        )}

        {/* Admin form */}
        {isAdmin && showForm && (
          <div className="bg-white rounded-xl shadow-[0_20px_30px_rgba(0,0,0,0.08)] p-8 mb-12">
            <h3 className="text-base font-bold text-gray-900 mb-1">New Entry</h3>
            <div className="w-10 h-0.5 bg-[#f4b940] mb-6" />

            {savedCaption ? (
              <SharePanel caption={savedCaption} siteUrl={SITE_URL} onDone={() => { setSavedCaption(null); setShowForm(false); }} />
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Diamond FM Station ID"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Tag</label>
                    <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] bg-white">
                      {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Date</label>
                    <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      placeholder="e.g. Mar 2025"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <FileText size={11} className="inline mr-1" />Description
                  </label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Describe this work..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none" />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <Image size={11} className="inline mr-1" />Pictures
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#f4b940] transition-colors text-sm text-gray-500">
                    <Plus size={14} /> Upload images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files, 'image')} />
                  </label>
                  {pendingImages.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {pendingImages.map((item, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <img src={item.preview} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => setPendingImages(p => p.filter((_, j) => j !== i))}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <Music size={11} className="inline mr-1" />Audio Files
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#f4b940] transition-colors text-sm text-gray-500">
                    <Plus size={14} /> Upload audio
                    <input type="file" accept="audio/*" multiple className="hidden" onChange={e => handleFiles(e.target.files, 'audio')} />
                  </label>
                  {pendingAudio.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {pendingAudio.map((a, i) => (
                        <li key={i} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                          <span className="truncate">{a.name}</span>
                          <button onClick={() => setPendingAudio(p => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 ml-2"><X size={12} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Video */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <Video size={11} className="inline mr-1" />Video Files
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#f4b940] transition-colors text-sm text-gray-500">
                    <Plus size={14} /> Upload video
                    <input type="file" accept="video/*" multiple className="hidden" onChange={e => handleFiles(e.target.files, 'video')} />
                  </label>
                  {pendingVideos.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {pendingVideos.map((v, i) => (
                        <li key={i} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                          <span className="truncate">{v.name}</span>
                          <button onClick={() => setPendingVideos(p => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 ml-2"><X size={12} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Social caption */}
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <Share2 size={11} className="inline mr-1" />Social Media Caption
                    <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea value={socialCaption} onChange={e => setSocialCaption(e.target.value)}
                    rows={2} placeholder="What to post on social media (auto-filled from title if blank)..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none" />
                </div>

                {saveError && <p className="text-xs text-red-500">{saveError}</p>}

                <button onClick={handleSave} disabled={!form.title.trim() || saving}
                  className="w-full bg-[#f4b940] hover:bg-yellow-400 disabled:opacity-50 text-black text-sm font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader size={14} className="animate-spin" />}
                  {saving ? 'Uploading…' : 'Save Entry'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sanity entries */}
        {loading && (
          <div className="flex justify-center py-10">
            <Loader size={24} className="animate-spin text-[#f4b940]" />
          </div>
        )}

        {sanityEntries.length > 0 && (
          <div className="mb-12">
            <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.2em] mb-6">Latest Uploads</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {sanityEntries.map(entry => (
                <SanityEntryCard key={entry._id} entry={entry} isAdmin={isAdmin} onDelete={handleDelete} activeAudioId={activeId} onPlayAudio={setActiveId} />
              ))}
            </div>
            <div className="border-t border-gray-200 my-10" />
          </div>
        )}

        {/* Hardcoded tracks */}
        {audioTracks.length > 0 && (
          <>
            {sanityEntries.length > 0 && <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.2em] mb-6">Archive</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {audioTracks.map((track) => (
                <AudioCard key={track.id} track={track} activeId={activeId} onPlay={setActiveId} />
              ))}
            </div>
          </>
        )}

        {!loading && sanityEntries.length === 0 && audioTracks.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Music size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tracks available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, Play, Pause, Music, Video, Image, FileText, Trash2, ChevronDown, ChevronUp, Lock, Loader, Share2 } from 'lucide-react';
import { client, writeClient } from '../sanityClient';
import SharePanel from './SharePanel';

// ── Change this to your preferred admin password ──────────────────────────────
const ADMIN_PASSWORD = 'SoundMasterH1@Admin';
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = 'https://henryogun.com/recentexperience';

const QUERY = `*[_type == "recentExperience"] | order(_createdAt desc) {
  _id,
  title,
  date,
  writeup,
  images[]{ asset->{ url } },
  audioFiles[]{ label, file{ asset->{ url, originalFilename } } },
  videoFiles[]{ label, file{ asset->{ url, originalFilename } } },
}`;

function AudioPlayer({ src, label }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
      <button onClick={toggle} className="w-8 h-8 bg-[#f4b940] rounded-full flex items-center justify-center shrink-0 hover:bg-yellow-400 transition-colors">
        {playing ? <Pause size={14} className="text-black" /> : <Play size={14} className="text-black ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 truncate">{label}</p>
        <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#f4b940] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={() => {
          if (audioRef.current) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
        }}
      />
    </div>
  );
}

function EntryCard({ entry, isAdmin, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Remove this entry?')) return;
    setDeleting(true);
    await onDelete(entry._id);
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_20px_20px_rgba(0,0,0,0.06)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
      {entry.images?.length > 0 && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
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
          {entry.date && <span className="text-xs text-[#f4b940] font-semibold shrink-0 whitespace-nowrap">{entry.date}</span>}
        </div>
        <div className="w-8 h-0.5 bg-[#f4b940] mb-3" />

        {entry.writeup && (
          <div>
            <p className={`text-xs text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>{entry.writeup}</p>
            {entry.writeup.length > 180 && (
              <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs text-[#f4b940] font-semibold flex items-center gap-0.5 hover:underline">
                {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
              </button>
            )}
          </div>
        )}

        {entry.audioFiles?.length > 0 && (
          <div className="mt-4 space-y-2">
            {entry.audioFiles.map((a, i) => (
              <AudioPlayer key={i} src={a.file?.asset?.url} label={a.label || a.file?.asset?.originalFilename || `Audio ${i + 1}`} />
            ))}
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

        {isAdmin && (
          <button onClick={handleDelete} disabled={deleting}
            className="mt-4 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
            {deleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />} Remove entry
          </button>
        )}
      </div>
    </div>
  );
}

function FeaturedVideoCard() {
  return (
    <div className="bg-white rounded-xl shadow-[0_20px_20px_rgba(0,0,0,0.06)] overflow-hidden mb-10 hover:-translate-y-1 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-gray-900 flex items-center justify-center min-h-[260px]">
          <video controls playsInline preload="auto" controlsList="nodownload" onContextMenu={e => e.preventDefault()} className="w-full max-h-[340px]">
            <source src="/pc-repair-video-web.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="p-8 flex flex-col justify-center">
          <span className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.2em] mb-2">Computer Repair & Maintenance</span>
          <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug">From screws to speed: full PC servicing done right.</h3>
          <div className="w-10 h-0.5 bg-[#f4b940] mb-4" />
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            Disassembled, cleaned, reloaded Windows, and brought this machine back to life. Sometimes your computer doesn't need replacing, it just needs the right hands on it.
          </p>
          <div className="flex flex-wrap gap-2">
            {['PC Repair', 'Windows Reinstall', 'Hardware Cleaning', 'Diagnostics'].map(tag => (
              <span key={tag} className="text-xs bg-yellow-50 text-yellow-700 font-semibold px-2.5 py-1 rounded-full border border-yellow-200">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecentExperiencePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('re_admin') === '1');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', writeup: '' });
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
    if (!client) return;
    setLoading(true);
    try {
      const data = await client.fetch(QUERY);
      setEntries(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleTitleClick = () => {
    titleClickCount.current += 1;
    clearTimeout(titleClickTimer.current);
    if (titleClickCount.current >= 3) {
      titleClickCount.current = 0;
      if (!isAdmin) setShowPasswordModal(true);
      else { sessionStorage.removeItem('re_admin'); setIsAdmin(false); }
    } else {
      titleClickTimer.current = setTimeout(() => { titleClickCount.current = 0; }, 600);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('re_admin', '1');
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password.');
    }
  };

  const handleFiles = (files, type) => {
    const arr = Array.from(files).map(f => ({ file: f, name: f.name, preview: type === 'image' ? URL.createObjectURL(f) : null }));
    if (type === 'image') setPendingImages(p => [...p, ...arr]);
    if (type === 'audio') setPendingAudio(p => [...p, ...arr]);
    if (type === 'video') setPendingVideos(p => [...p, ...arr]);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !writeClient) return;
    setSaving(true);
    setSaveError('');
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
        _type: 'recentExperience',
        title: form.title.trim(),
        date: form.date.trim(),
        writeup: form.writeup.trim(),
        images: imageRefs,
        audioFiles: audioRefs,
        videoFiles: videoRefs,
      });

      const caption = socialCaption.trim() || `${form.title.trim()}${form.writeup.trim() ? ' — ' + form.writeup.trim().slice(0, 200) : ''}`;
      setSavedCaption(caption);
      setForm({ title: '', date: '', writeup: '' });
      setSocialCaption('');
      setPendingImages([]);
      setPendingAudio([]);
      setPendingVideos([]);
      await fetchEntries();
    } catch (err) {
      console.error(err);
      setSaveError('Upload failed. Check your Sanity write token in .env');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!writeClient) return;
    await writeClient.delete(id);
    setEntries(prev => prev.filter(e => e._id !== id));
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 scale-110"
        style={{ backgroundImage: 'url(/h7.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top', filter: 'blur(3px)', zIndex: 0 }} />
      <div className="fixed inset-0 bg-white/90" style={{ zIndex: 1 }} />

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
              <input
                type="password"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
                placeholder="Enter password"
                autoFocus
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent"
              />
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              <button type="submit" className="w-full bg-[#f4b940] hover:bg-yellow-400 text-black text-sm font-bold py-2.5 rounded-lg transition-colors">
                Unlock
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="relative py-24" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Portfolio</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 cursor-default select-none" onClick={handleTitleClick}>
              Recent Experience
            </h2>
            <div className="w-20 h-1 bg-[#f4b940] mx-auto mb-6" />
            <p className="text-gray-500 text-sm max-w-lg mx-auto">A living record of recent work: audio, video, images and context behind each project.</p>
            {isAdmin && <p className="mt-2 text-xs text-[#f4b940] font-semibold">Admin mode active — triple-click title to sign out</p>}
          </div>

          {/* Add entry button (admin only) */}
          {isAdmin && (
            <div className="flex justify-center mb-10">
              <button onClick={() => { setShowForm(!showForm); setSavedCaption(null); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#f4b940] text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                <Plus size={16} />
                {showForm ? 'Cancel' : 'Add New Entry'}
              </button>
            </div>
          )}

          {/* Add entry form (admin only) */}
          {isAdmin && showForm && (
            <div className="bg-white rounded-xl shadow-[0_20px_30px_rgba(0,0,0,0.08)] p-8 mb-12 max-w-2xl mx-auto">
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
                        placeholder="e.g. Diamond FM Studio Session"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Date / Period</label>
                      <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        placeholder="e.g. March 2025"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      <FileText size={11} className="inline mr-1" />Write-up
                    </label>
                    <textarea value={form.writeup} onChange={e => setForm(f => ({ ...f, writeup: e.target.value }))}
                      rows={4} placeholder="Describe the work, context, or outcome..."
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
                      <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal">(optional — auto-filled from title if blank)</span>
                    </label>
                    <textarea value={socialCaption} onChange={e => setSocialCaption(e.target.value)}
                      rows={3} placeholder="Write what you want posted on Twitter, Facebook, LinkedIn, Instagram, WhatsApp..."
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

          {/* Featured pinned entry */}
          <FeaturedVideoCard />

          {/* Entries grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader size={28} className="animate-spin text-[#f4b940]" />
            </div>
          ) : entries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {entries.map(entry => (
                <EntryCard key={entry._id} entry={entry} isAdmin={isAdmin} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No entries yet.</p>
              {isAdmin && <p className="text-sm mt-1">Click "Add New Entry" to get started.</p>}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

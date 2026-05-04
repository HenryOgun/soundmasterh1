import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, Image, FileText, Trash2, ChevronDown, ChevronUp, Lock, Loader, Share2 } from 'lucide-react';
import { client, writeClient } from '../sanityClient';
import SharePanel from './SharePanel';

const ADMIN_PASSWORD = 'SoundMasterH1@Admin';

const TAG_OPTIONS = ['Project', 'Award', 'Certification', 'Initiative'];

const PAGE_META = {
  broadcast: {
    label: 'Broadcast Projects',
    sub: 'Radio engineering, transmission, and broadcast infrastructure',
    sessionKey: 're_admin_broadcast',
    siteUrl: 'https://henryogun.com/projects/broadcast',
    category: 'Broadcast',
  },
  tech: {
    label: 'Tech Projects',
    sub: 'Full-stack development, tools, and digital innovation',
    sessionKey: 're_admin_tech',
    siteUrl: 'https://henryogun.com/projects/tech',
    category: 'Tech',
  },
};

const tagColors = {
  Project: 'bg-blue-100 text-blue-700',
  Award: 'bg-yellow-100 text-yellow-700',
  Certification: 'bg-purple-100 text-purple-700',
  Initiative: 'bg-emerald-100 text-emerald-700',
};

function ProjectCard({ item, isAdmin, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Remove this project?')) return;
    setDeleting(true);
    await onDelete(item._id);
  };

  const image = item.imageUrl || item.image;
  const content = item.content || item.localContent;

  return (
    <div className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-[0_20px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
      {image && (
        <div className="relative overflow-hidden" style={{ paddingBottom: '62%' }}>
          <img src={image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {item.tag && (
            <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${tagColors[item.tag] || 'bg-gray-100 text-gray-600'}`}>
              {item.tag}
            </span>
          )}
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#f4b940] transition-colors">{item.title}</h3>
          {item.date && <span className="text-xs text-[#f4b940] font-semibold shrink-0 whitespace-nowrap">{item.date}</span>}
        </div>
        <div className="w-10 h-0.5 bg-[#f4b940] mb-3 group-hover:w-16 transition-all duration-300" />
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-2">{item.description}</p>

        {content && (
          <div>
            {expanded && (
              <p className="text-xs text-gray-600 leading-relaxed mt-2 whitespace-pre-line">{content}</p>
            )}
            <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs text-[#f4b940] font-semibold flex items-center gap-0.5 hover:underline">
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
            </button>
          </div>
        )}

        {item.readTime && (
          <p className="text-xs text-gray-400 mt-3 border-t border-gray-100 pt-3">{item.readTime}</p>
        )}

        {isAdmin && item._id && !item._id.startsWith('local-') && (
          <button onClick={handleDelete} disabled={deleting}
            className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
            {deleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />} Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProjectsAdminPage({ pageType, localData = [] }) {
  const meta = PAGE_META[pageType];
  const [sanityItems, setSanityItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(meta.sessionKey) === '1');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', tag: 'Project', description: '', date: '', readTime: '', content: '' });
  const [socialCaption, setSocialCaption] = useState('');
  const [pendingImage, setPendingImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedCaption, setSavedCaption] = useState(null);
  const titleClickCount = useRef(0);
  const titleClickTimer = useRef(null);

  const fetchItems = useCallback(async () => {
    if (!client) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await client.fetch(
        `*[_type == "project" && pageType == $pt] | order(_createdAt desc) { _id, title, tag, description, date, readTime, content, "imageUrl": image.asset->url }`,
        { pt: pageType }
      );
      setSanityItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pageType]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleTitleClick = () => {
    titleClickCount.current += 1;
    clearTimeout(titleClickTimer.current);
    if (titleClickCount.current >= 3) {
      titleClickCount.current = 0;
      if (!isAdmin) setShowPasswordModal(true);
      else { sessionStorage.removeItem(meta.sessionKey); setIsAdmin(false); }
    } else {
      titleClickTimer.current = setTimeout(() => { titleClickCount.current = 0; }, 600);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(meta.sessionKey, '1');
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password.');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !writeClient) return;
    setSaving(true);
    setSaveError('');
    try {
      let imageRef = undefined;
      if (pendingImage) {
        const asset = await writeClient.assets.upload('image', pendingImage, { filename: pendingImage.name });
        imageRef = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
      }

      await writeClient.create({
        _type: 'project',
        pageType,
        title: form.title.trim(),
        tag: form.tag,
        description: form.description.trim(),
        date: form.date.trim(),
        readTime: form.readTime.trim(),
        content: form.content.trim(),
        ...(imageRef && { image: imageRef }),
      });

      const caption = socialCaption.trim() || `${form.title.trim()}${form.description.trim() ? ' — ' + form.description.trim().slice(0, 200) : ''}`;
      setSavedCaption(caption);
      setForm({ title: '', tag: 'Project', description: '', date: '', readTime: '', content: '' });
      setSocialCaption('');
      setPendingImage(null);
      await fetchItems();
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
    setSanityItems(prev => prev.filter(e => e._id !== id));
  };

  const localMapped = localData.map(a => ({
    _id: `local-${a.id}`,
    title: a.title,
    tag: a.tag,
    description: a.description,
    date: a.date,
    readTime: a.readTime,
    image: a.image,
    localContent: a.content,
  }));

  const allItems = [...sanityItems, ...localMapped];

  return (
    <section className="py-24 bg-[#f9f9f9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

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

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">{meta.sub}</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 cursor-default select-none" onClick={handleTitleClick}>{meta.label}</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto" />
          {isAdmin && <p className="mt-4 text-xs text-[#f4b940] font-semibold">Admin mode active — triple-click title to sign out</p>}
        </div>

        {/* Admin button */}
        {isAdmin && (
          <div className="flex justify-center mb-10">
            <button onClick={() => { setShowForm(!showForm); setSavedCaption(null); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#f4b940] text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors">
              <Plus size={16} />
              {showForm ? 'Cancel' : 'Add New Project'}
            </button>
          </div>
        )}

        {/* Admin form */}
        {isAdmin && showForm && (
          <div className="bg-white rounded-xl shadow-[0_20px_30px_rgba(0,0,0,0.08)] p-8 mb-12 max-w-2xl mx-auto">
            <h3 className="text-base font-bold text-gray-900 mb-1">New Project</h3>
            <div className="w-10 h-0.5 bg-[#f4b940] mb-6" />

            {savedCaption ? (
              <SharePanel caption={savedCaption} siteUrl={meta.siteUrl} onDone={() => { setSavedCaption(null); setShowForm(false); }} />
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Royal FM Studio Revamp"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Tag</label>
                    <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent bg-white">
                      {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Date / Period</label>
                    <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      placeholder="e.g. 2023 to Present"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Read Time</label>
                    <input value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                      placeholder="e.g. 4 min read"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <FileText size={11} className="inline mr-1" />Short Description
                  </label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="One or two sentences shown on the card..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Full Content</label>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={6} placeholder="Full write-up shown when expanded..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <Image size={11} className="inline mr-1" />Cover Image
                  </label>
                  {pendingImage ? (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                      <img src={URL.createObjectURL(pendingImage)} className="w-12 h-12 object-cover rounded" alt="" />
                      <span className="text-xs text-gray-600 flex-1 truncate">{pendingImage.name}</span>
                      <button onClick={() => setPendingImage(null)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#f4b940] transition-colors text-sm text-gray-500">
                      <Plus size={14} /> Upload image
                      <input type="file" accept="image/*" className="hidden" onChange={e => setPendingImage(e.target.files[0] || null)} />
                    </label>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <Share2 size={11} className="inline mr-1" />Social Media Caption
                    <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea value={socialCaption} onChange={e => setSocialCaption(e.target.value)}
                    rows={2} placeholder="Write what to post on social media (auto-filled from title if blank)..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none" />
                </div>

                {saveError && <p className="text-xs text-red-500">{saveError}</p>}

                <button onClick={handleSave} disabled={!form.title.trim() || saving}
                  className="w-full bg-[#f4b940] hover:bg-yellow-400 disabled:opacity-50 text-black text-sm font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader size={14} className="animate-spin" />}
                  {saving ? 'Uploading…' : 'Save Project'}
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <Loader size={28} className="animate-spin text-[#f4b940]" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allItems.map(item => (
            <ProjectCard key={item._id} item={item} isAdmin={isAdmin} onDelete={handleDelete} />
          ))}
        </div>

        {!loading && allItems.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No projects yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

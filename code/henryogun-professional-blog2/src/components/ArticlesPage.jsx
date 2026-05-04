import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Plus, X, Image, FileText, Lock, Loader, Share2 } from 'lucide-react';
import { client, writeClient } from '../sanityClient';
import { PortableText } from '@portabletext/react';
import { getCardsByPage } from './data';
import SharePanel from './SharePanel';

const ADMIN_PASSWORD = 'SoundMasterH1@Admin';
const SITE_URL = 'https://henryogun.com/articles';

const CATEGORIES = ['Broadcast Engineering', 'Tech Education', 'Full-Stack Dev', 'Audio Production', 'Opinion'];
const TAGS = ['Article', 'Opinion', 'Tutorial', 'News'];

const tagColors = {
  Article: 'bg-emerald-100 text-emerald-700',
  Opinion: 'bg-blue-100 text-blue-700',
  Tutorial: 'bg-purple-100 text-purple-700',
  News: 'bg-rose-100 text-rose-700',
};

const ARTICLES_QUERY = `*[_type == "article"] | order(publishedAt desc) {
  _id,
  title,
  category,
  tag,
  description,
  publishedAt,
  readTime,
  "imageUrl": image.asset->url,
  body
}`;

const localArticles = getCardsByPage('articles').map(a => ({
  _id: `local-${a.id}`,
  title: a.title,
  category: a.category,
  tag: a.tag,
  description: a.description,
  publishedAt: null,
  readTime: a.readTime,
  imageUrl: a.image,
  date: a.date,
  body: null,
  localContent: a.content,
}));

const textToBlocks = (text) =>
  text.split('\n\n').filter(Boolean).map((para, i) => ({
    _type: 'block',
    _key: `b${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${i}`, text: para, marks: [] }],
  }));

export default function ArticlesPage() {
  const [sanityArticles, setSanityArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('re_admin_articles') === '1');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Broadcast Engineering', tag: 'Article', description: '', date: '', readTime: '5 min read', body: '' });
  const [socialCaption, setSocialCaption] = useState('');
  const [pendingImage, setPendingImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedCaption, setSavedCaption] = useState(null);
  const titleClickCount = useRef(0);
  const titleClickTimer = useRef(null);

  const fetchArticles = useCallback(async () => {
    if (!client) { setLoading(false); return; }
    client.fetch(ARTICLES_QUERY)
      .then((data) => { setSanityArticles(data || []); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const articles = [...sanityArticles, ...localArticles];

  const handleTitleClick = () => {
    titleClickCount.current += 1;
    clearTimeout(titleClickTimer.current);
    if (titleClickCount.current >= 3) {
      titleClickCount.current = 0;
      if (!isAdmin) setShowPasswordModal(true);
      else { sessionStorage.removeItem('re_admin_articles'); setIsAdmin(false); }
    } else {
      titleClickTimer.current = setTimeout(() => { titleClickCount.current = 0; }, 600);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('re_admin_articles', '1');
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
        _type: 'article',
        title: form.title.trim(),
        category: form.category,
        tag: form.tag,
        description: form.description.trim(),
        publishedAt: new Date().toISOString(),
        readTime: form.readTime.trim(),
        body: form.body.trim() ? textToBlocks(form.body.trim()) : undefined,
        ...(imageRef && { image: imageRef }),
      });

      const caption = socialCaption.trim() || `${form.title.trim()}${form.description.trim() ? ' — ' + form.description.trim().slice(0, 200) : ''}`;
      setSavedCaption(caption);
      setForm({ title: '', category: 'Broadcast Engineering', tag: 'Article', description: '', date: '', readTime: '5 min read', body: '' });
      setSocialCaption('');
      setPendingImage(null);
      await fetchArticles();
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
    setSanityArticles(prev => prev.filter(a => a._id !== id));
  };

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
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">
            Thoughts on broadcast engineering, tech, and audio production
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 cursor-default select-none" onClick={handleTitleClick}>Articles</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto" />
          {isAdmin && <p className="mt-4 text-xs text-[#f4b940] font-semibold">Admin mode active — triple-click title to sign out</p>}
        </div>

        {/* Admin button */}
        {isAdmin && (
          <div className="flex justify-center mb-10">
            <button onClick={() => { setShowForm(!showForm); setSavedCaption(null); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#f4b940] text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors">
              <Plus size={16} />
              {showForm ? 'Cancel' : 'Add New Article'}
            </button>
          </div>
        )}

        {/* Admin form */}
        {isAdmin && showForm && (
          <div className="bg-white rounded-xl shadow-[0_20px_30px_rgba(0,0,0,0.08)] p-8 mb-12 max-w-2xl mx-auto">
            <h3 className="text-base font-bold text-gray-900 mb-1">New Article</h3>
            <div className="w-10 h-0.5 bg-[#f4b940] mb-6" />

            {savedCaption ? (
              <SharePanel caption={savedCaption} siteUrl={SITE_URL} onDone={() => { setSavedCaption(null); setShowForm(false); }} />
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Article title..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] bg-white">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Tag</label>
                    <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] bg-white">
                      {TAGS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Date Label</label>
                    <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      placeholder="e.g. Jan 2025"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Read Time</label>
                    <input value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                      placeholder="e.g. 5 min read"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    <FileText size={11} className="inline mr-1" />Short Description
                  </label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Short summary shown on the card..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Full Article Body</label>
                  <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    rows={8} placeholder="Write the full article here..."
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
                    rows={2} placeholder="What to post on social media (auto-filled from title if blank)..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none" />
                </div>

                {saveError && <p className="text-xs text-red-500">{saveError}</p>}

                <button onClick={handleSave} disabled={!form.title.trim() || saving}
                  className="w-full bg-[#f4b940] hover:bg-yellow-400 disabled:opacity-50 text-black text-sm font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader size={14} className="animate-spin" />}
                  {saving ? 'Uploading…' : 'Publish Article'}
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Loading articles...</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article
              key={article._id}
              onClick={() => setSelected(article)}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-[0_20px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="relative overflow-hidden" style={{ paddingBottom: '125%' }}>
                <img
                  src={article.imageUrl || `https://placehold.co/400x500/f9f9f9/cccccc?text=${encodeURIComponent(article.category || 'Article')}`}
                  alt={article.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${tagColors[article.tag] || 'bg-gray-100 text-gray-600'}`}>
                  {article.tag || 'Article'}
                </span>
                {isAdmin && !article._id.startsWith('local-') && (
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(article._id); }}
                    className="absolute top-3 right-3 w-6 h-6 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-[#f4b940] uppercase tracking-widest mb-2">{article.category}</p>
                <h3 className="text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-[#f4b940] transition-colors">
                  {article.title}
                </h3>
                <div className="w-10 h-0.5 bg-[#f4b940] mb-3 group-hover:w-16 transition-all duration-300" />
                <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{article.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : (article.date || '')}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{article.readTime || '5 min read'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center px-4 py-10 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-xl font-bold text-gray-400 hover:text-gray-700 leading-none">×</button>
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.title} className="w-full h-56 object-cover rounded-lg mb-6" />
            )}
            <p className="text-xs font-bold text-[#f4b940] uppercase tracking-widest mb-2">{selected.category}</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selected.title}</h2>
            <div className="w-12 h-0.5 bg-[#f4b940] mb-4" />
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
              {selected.body ? (
                <PortableText value={selected.body} />
              ) : selected.localContent ? (
                selected.localContent.split('\n\n').map((para, i) => {
                  if (para.startsWith('**') && para.endsWith('**')) {
                    return <h4 key={i} className="font-bold text-gray-800 mt-4 mb-1">{para.replace(/\*\*/g, '')}</h4>;
                  }
                  if (para.startsWith('- ') || para.includes('\n- ')) {
                    return (
                      <ul key={i} className="list-disc list-inside space-y-1 mb-2">
                        {para.split('\n').filter(l => l.startsWith('- ')).map((line, j) => (
                          <li key={j}>{line.replace(/^- /, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="mb-3">{para.replace(/\*\*/g, '')}</p>;
                })
              ) : (
                <p>{selected.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

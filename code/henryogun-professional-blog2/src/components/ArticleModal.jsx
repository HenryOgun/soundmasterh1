import { useEffect } from 'react';
import { X, Clock } from 'lucide-react';

export default function ArticleModal({ article, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-gray-900 mt-4 mb-1">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-gray-600 text-sm">{line.slice(2)}</li>;
      }
      if (line.trim() === '') return <br key={i} />;
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <p key={i} className="text-sm text-gray-600 leading-relaxed">{parts}</p>;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
        <div className="relative" style={{ paddingBottom: '50%' }}>
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://placehold.co/800x400/f3f4f6/9ca3af?text=${encodeURIComponent(article.category)}`;
            }}
          />
          <button onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 hover:bg-white transition-colors shadow-md">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-xs font-semibold text-[#f4b940] uppercase tracking-wide">{article.category}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{article.date}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} /> {article.readTime}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">{article.title}</h2>
          <div className="space-y-1">{renderContent(article.content)}</div>
        </div>
      </div>
    </div>
  );
}

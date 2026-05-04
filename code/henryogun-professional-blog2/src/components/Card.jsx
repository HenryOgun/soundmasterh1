import { Clock } from 'lucide-react';

const tagColors = {
  Project: 'bg-yellow-100 text-yellow-800',
  Article: 'bg-emerald-100 text-emerald-700',
  Award: 'bg-amber-100 text-amber-700',
  Certification: 'bg-purple-100 text-purple-700',
  Initiative: 'bg-rose-100 text-rose-700',
};

export default function Card({ item, onClick }) {
  return (
    <article
      onClick={() => onClick(item)}
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-[0_20px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)] transition-all duration-300"
    >
      {/* Portrait image — 4:5 ratio */}
      <div className="relative overflow-hidden" style={{ paddingBottom: '125%' }}>
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x500/f9f9f9/cccccc?text=${encodeURIComponent(item.category)}`;
          }}
        />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${tagColors[item.tag] || 'bg-gray-100 text-gray-600'}`}>
          {item.tag}
        </span>
      </div>

      <div className="p-6">
        <p className="text-xs font-bold text-[#f4b940] uppercase tracking-widest mb-2">{item.category}</p>
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-[#f4b940] transition-colors">
          {item.title}
        </h3>
        {/* Gold underline */}
        <div className="w-10 h-0.5 bg-[#f4b940] mb-3 group-hover:w-16 transition-all duration-300" />
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
          <span>{item.date}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{item.readTime}</span>
        </div>
      </div>
    </article>
  );
}

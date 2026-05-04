import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Radio, Lightbulb } from 'lucide-react';

const subsections = [
  {
    icon: Trophy,
    title: 'Industry Awards & Recognition',
    items: [
      {
        text: '🏆 ICFJ Awards 2018: Climate Migration Documentary',
        navLink: '/achievements#icfj-award',
      },
      {
        text: '🎙️ Nigerian Broadcasters Merit Award: Best Radio Imaging, North Central',
        navLink: '/achievements#nbma-award',
      },
    ],
  },
  {
    icon: Radio,
    title: 'High-Impact Projects',
    items: [
      {
        text: 'Studio revamp at Royal FM and end-to-end commissioning at Diamond FM across two cities.',
        navLink: '/achievements#broadcast-engineering',
      },
      {
        text: 'Led the Kwara TV rebranding project reaching an audience of 4 million viewers',
        navLink: '/achievements#kwara-tv',
      },
      {
        text: 'Collaborated with BBC Media Action and Radio Netherlands Worldwide on content production and signal distribution',
        navLink: '/achievements#radio-netherlands',
      },
    ],
  },
  {
    icon: Lightbulb,
    title: 'Audio Production',
    items: [
      {
        text: 'Commissioned to produce five political advocacy tracks and over 25 public service announcements, contributing to a successful electoral outcome and community impact.',
        navLink: '/achievements#kwara-commission',
      },
      {
        text: 'Over 180 station IDs, jingles and promo spots across multiple stations, using industry-leading DAWs.',
        navLink: '/achievements#audio-production',
      },
    ],
  },
];

const footprintLogos = [
  { src: '/logo/kwara state logo.jpeg', alt: 'Kwara State' },
  { src: '/logo/bbc logo.png', alt: 'BBC Media Action' },
  { src: '/rfm logo.png', alt: 'Royal FM Ilorin' },
  { src: '/logo/diamond ilesa.png', alt: 'Diamond FM Ilesa' },
  { src: '/logo/kwara tv 2.png', alt: 'Kwara TV' },
  { src: '/logo/diamond ilr 2.png', alt: 'Diamond FM Ilorin' },
  { src: '/logo/Radio_Netherlands_Worldwide.svg', alt: 'Radio Netherlands Worldwide' },
  { src: '/Fiolu Pharmacy.jpeg', alt: 'Fiolu Pharmacy' },
  { src: '/Tuyil Pharmaceuticals Limited.png', alt: 'Tuyil Pharmaceuticals' },
  { src: '/sigma Pension.png', alt: 'Sigma Pension' },
];

export default function HomeAchievements() {
  const [popupContent, setPopupContent] = useState(null);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupLogos, setPopupLogos] = useState(null);
  const [popupBgImage, setPopupBgImage] = useState(null);
  const [popupBgBlur, setPopupBgBlur] = useState(2);
  const [popupUrl, setPopupUrl] = useState(null);

  return (
    <section className="relative py-24 overflow-hidden">
      {popupContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => { setPopupContent(null); setPopupUrl(null); }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {popupBgImage && (
              <div
                className="absolute inset-0"
                style={{ backgroundImage: `url("${popupBgImage}")`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25, mixBlendMode: 'multiply', filter: `blur(${popupBgBlur}px)`, transform: 'scale(1.05)' }}
              />
            )}
            <div className="relative z-10">
            <button
              onClick={() => { setPopupContent(null); setPopupUrl(null); }}
              className="absolute top-4 right-4 text-xl font-bold leading-none text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
            <div className="w-10 h-10 bg-[#f4b940] rounded-lg flex items-center justify-center mb-4">
              <Trophy size={20} className="text-black" />
            </div>
            <h3 className="text-base font-bold mb-3 text-gray-900">{popupTitle}</h3>
            <div className="w-12 h-0.5 bg-[#f4b940] mb-4" />
            {popupContent.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed mb-3 text-gray-600">{para}</p>
            ))}
            {popupUrl && (
              <a href={popupUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 mb-3 text-sm font-semibold text-[#f4b940] hover:underline">
                View on ICFJ →
              </a>
            )}
            {popupLogos && (
              <>
                <style>{`
                  @keyframes scrollLogos {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                  }
                  .logo-scroll-track {
                    animation: scrollLogos 14s linear infinite;
                  }
                `}</style>
                <div className="mt-4 overflow-hidden">
                  <div className="logo-scroll-track flex gap-8 w-max">
                    {[...popupLogos, ...popupLogos].map((logo, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 shrink-0 min-w-[72px]">
                        <img src={logo.src} alt={logo.alt} className="h-10 w-10 object-contain" />
                        <span className="text-xs text-gray-400 whitespace-nowrap">{logo.alt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      )}
      {/* h7.jpg blended with white */}
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: 'url(/h7.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
      />
      <div className="absolute inset-0 bg-white/90" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What I Bring</h2>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subsections.map(({ icon: Icon, title, badge, items }) => (
            <div
              key={title}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-[0_20px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[#f4b940] rounded-lg flex items-center justify-center mb-5">
                <Icon size={22} className="text-black" />
              </div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                {badge && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">{badge}</span>
                )}
              </div>
              <div className="w-16 h-0.5 bg-[#f4b940] mb-4" />
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#f4b940] shrink-0" />
                    {typeof item === 'object' && item.navLink ? (
                      <Link to={item.navLink} className="hover:text-[#f4b940] transition-colors duration-200">{item.text}</Link>
                    ) : typeof item === 'object' && item.popup ? (
                      <button onClick={() => { setPopupContent(item.popup); setPopupTitle(item.title || item.text); setPopupLogos(item.logos || null); setPopupBgImage(item.bgImage || null); setPopupBgBlur(item.bgBlur ?? 2); setPopupUrl(item.url || null); }} className="text-left hover:text-[#f4b940] transition-colors duration-200 cursor-pointer">{item.text}</button>
                    ) : typeof item === 'object' && item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#f4b940] transition-colors duration-200">{item.text}</a>
                    ) : (
                      <span>{item}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Career Footprint */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-2">Career Footprint</p>
            <div className="w-12 h-0.5 bg-[#f4b940] mx-auto" />
          </div>
          <style>{`
            @keyframes scrollFootprint {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .footprint-scroll-track {
              animation: scrollFootprint 18s linear infinite;
            }
          `}</style>
          <div className="overflow-hidden">
            <div className="footprint-scroll-track flex gap-12 w-max items-center">
              {[...footprintLogos, ...footprintLogos].map((logo, i) => (
                <div key={i} className="flex flex-col items-center gap-2 shrink-0 min-w-[80px]">
                  <img src={logo.src} alt={logo.alt} className="h-20 w-28 object-contain" />
                  <span className="text-xs text-gray-400 whitespace-nowrap text-center">{logo.alt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

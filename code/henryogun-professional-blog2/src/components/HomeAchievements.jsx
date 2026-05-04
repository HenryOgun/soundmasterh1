import { useState } from 'react';
import { Trophy, Radio, Lightbulb, BadgeCheck, Mic2 } from 'lucide-react';

const subsections = [
  {
    icon: Trophy,
    title: 'Industry Awards & Recognition',
    items: [
      '🏆 2nd Place ICFJ Awards 2018 for a Climate Migration Documentary',
      '🎙️ Nigerian Broadcasters Merit Award for Best Radio Imaging North Central 2013 at Royal FM',
    ],
  },
  {
    icon: Radio,
    title: 'High-Impact Projects',
    items: [
      'Led the Kwara TV rebranding project reaching an audience of 4 million viewers',
      'Collaborated with Radio Netherlands Worldwide on content production and signal distribution',
      'Over 15 years of broadcast engineering experience across multiple stations',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Audio Production',
    items: [
      'Produced 5 political advocacy tracks for the 2015 Kwara State gubernatorial campaign that contributed to a successful electoral outcome',
      'Station IDs, jingles, promo spots and broadcast audio across multiple stations',
      'Proficient in Pro Tools, Logic Pro, Cubase, Nuendo and Sonar',
    ],
  },
  {
    icon: BadgeCheck,
    title: 'Certifications',
    items: [
      'Certified African Social Venture Planner (CASVP)',
      'Full Stack Software Engineering Certification',
      'Generative AI Certification',
      'Diploma in Audio System Engineering',
    ],
  },
  {
    icon: Mic2,
    title: 'Current Role',
    items: [
      'Group Chief Engineer at Diamond FM overseeing broadcast operations for Diamond 88.7 FM in Ilorin and Diamond 88.5 FM in Ilesa',
    ],
  },
];

export default function HomeAchievements() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? subsections : subsections.slice(0, 3);

  return (
    <section className="relative py-24 overflow-hidden">
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
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Career Highlights</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Milestones</h2>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map(({ icon: Icon, title, badge, items }) => (
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
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-semibold text-[#f4b940] border border-[#f4b940] px-6 py-2 rounded hover:bg-[#f4b940] hover:text-black transition-all duration-300"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>
    </section>
  );
}

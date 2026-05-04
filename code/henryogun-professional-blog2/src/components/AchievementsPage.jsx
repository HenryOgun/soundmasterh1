import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Award, Mic, Star, Users, BookOpen, Code, Radio, BadgeCheck, Trophy } from 'lucide-react';

const sections = [
  {
    label: 'Industry Awards & Recognition',
    items: [
      {
        id: 'icfj-award',
        icon: Award,
        year: '2018',
        title: '2nd Place ICFJ Awards',
        body: 'For a climate migration documentary. Recognised by the International Center for Journalists in Washington D.C.',
        popup: `Produced "Ilorin: The Place Called Away", an in-depth radio documentary for Royal FM examining how rapid population growth has driven the proliferation of illegal dump sites across Ilorin and their consequent impact on the environment and public health.\n\nThe documentary was entered into the ICFJ Reporting Program on Migration and Climate for Nigerian Journalists, where it placed 2nd. Click the link below to learn more.`,
        url: 'https://www.icfj.org/our-work/reporting-program-migration-and-climate-nigerian-journalists',
        bgImage: '/icjf logo.webp',
        bgOpacity: 0.18,
        bgBlur: 3,
      },
      {
        id: 'nbma-award',
        icon: Mic,
        year: '2013',
        title: 'Nigerian Broadcasters Merit Award',
        body: 'Best Radio Imaging North Central. Presented by the Nigerian Broadcasting Commission at Royal FM.',
        bgImage: '/logo/nbma award 2.jpg',
        popup: `2013 was a defining year for Royal FM 95.1 Ilorin. The station won the Best Radio Imaging Station award in the North Central category at the Nigerian Broadcasters Merit Awards, recognition earned through the craft and consistency the team had built into every broadcast. Henry Ogun was the engineer behind that sound. He designed the audio identity that caught the industry's attention and made the win possible.\n\nEarlier that same year in February, Royal FM also claimed Radio Station of the Year in the South-West category. Two major awards in twelve months. Through both of them, Henry was at the console, shaping the listening experience that put the station on the national map. It was quiet confirmation of what those in the room already knew.`,
      },
    ],
  },
  {
    label: 'High-Impact Projects',
    items: [
      {
        id: 'kwara-tv',
        icon: Star,
        year: '',
        title: 'Kwara TV Rebranding Project',
        body: 'Led the full rebranding of Kwara TV, extending its reach to an audience of 4 million viewers.',
        bgImage: '/logo/kwara tv.jpeg',
        bgBlur: 5,
        popup: `One of Henry's more memorable contributions was reworking the signature instrumental theme for the station's owned television channel, the piece that opens every broadcast and brings it to a close each night. It is the kind of music that millions of people hear without really thinking about it, yet it sets the tone for everything that follows.\n\nGetting it right matters more than most people realise. Henry understood that, and the result was a refreshed sound that carried across a viewership of over four million people.`,
      },
      {
        id: 'kwara-commission',
        icon: Star,
        year: '2013',
        title: 'Kwara State Government Commission',
        body: 'Produced 5 political advocacy tracks for the Kwara State gubernatorial reelection campaign, contributing to a successful electoral outcome, and delivered over 25 public service announcements across various community impact initiatives.',
        bgImage: '/logo/kwara state logo.jpeg',
        popup: `In the build-up to the 2015 Kwara State gubernatorial election, Henry produced five political advocacy tracks that combined sonic craftsmanship with strategic messaging, connecting emotionally with voters and contributing to a successful electoral outcome. The project demonstrated his ability to deploy audio production beyond the studio, into spaces where sound carries real consequence. He also produced over 25 public service announcements, further cementing his role as a trusted voice in community-focused broadcast communication.`,
      },
      {
        id: 'radio-netherlands',
        icon: Radio,
        year: '2014 to 2018',
        title: 'International Media Engagements',
        body: 'Selected across 4 editions of the African Development Exchange Programme for exceptional broadcast journalism on African development themes.',
        popup: `Among the things that set Henry Ogun apart in his broadcasting career is the fact that he produced content for some of the most respected names in international media, including BBC Media Action and Radio Netherlands Worldwide. Not many broadcast professionals in Nigeria can say that.\n\nIt takes a certain level of skill, discipline and understanding of global standards to work at that level, and Henry delivered. Those partnerships were a testament not just to what Royal FM stood for, but to what Henry personally brought to the table.`,
        logos: [
          { src: '/logo/bbc media action logo.png', alt: 'BBC Media Action' },
          { src: '/logo/Radio_Netherlands_Worldwide.svg', alt: 'Radio Netherlands Worldwide' },
        ],
      },
      {
        id: 'broadcast-engineering',
        icon: BookOpen,
        year: '15+ yrs',
        title: 'Broadcast Engineering Experience',
        body: 'Over 15 years of broadcast engineering experience spanning multiple stations across Nigeria.',
        popup: `With over fifteen years of broadcast engineering experience spanning multiple stations, Henry Ogun has built a career that speaks for itself. At Royal FM, he invested seven years actively shaping the station's technical and creative output, while also keeping its computer systems and IT infrastructure running at full capacity. His ability to handle both broadcast engineering and computer repair and maintenance made him an indispensable part of the operation, the kind of professional who could walk into any technical challenge and find a way through it.\n\nWhen Diamond FM was being established, Henry was there from day one. As a pioneer engineer on the project, he was part of the core team that set up not one but two stations from scratch, Diamond 88.7 FM in Ilorin and Diamond 88.5 FM in Ilesa. That work demanded a full spectrum of technical skills covering broadcast engineering, IT systems, networking and hardware configuration. Henry brought all of it, and the stations he helped build stand as a lasting testament to the depth and versatility he carries as both a broadcast engineer and a technology professional.`,
      },
      {
        id: 'audio-production',
        icon: Mic,
        year: '',
        title: 'Audio Production',
        body: 'Produced over 180 station IDs, jingles, promo spots and broadcast audio across multiple stations, leveraging proficiency in Adobe Audition, Pro Tools, Logic Pro, Cubase, Nuendo and Sonar Platinum.',
        popup: `Henry Ogun has built a substantial body of broadcast audio work across multiple stations: station IDs, jingles, promo spots and more, crafting the sonic identity that listeners carry long after switching off the radio. He brings that work to life through genuine fluency across the industry's leading DAWs: Adobe Audition, Pro Tools, Logic Pro, Cubase, Nuendo and Sonar Platinum. That multi-platform range means he can walk into any studio environment and get to work without missing a beat.`,
        logos: [
          { src: '/logo/adobe audition.png', alt: 'Adobe Audition' },
          { src: '/logo/ProTools-Icon.png', alt: 'Pro Tools' },
          { src: '/logo/logic pro.jpeg', alt: 'Logic Pro' },
          { src: '/logo/cubase.png', alt: 'Cubase' },
          { src: '/logo/nuendo.jpeg', alt: 'Nuendo' },
          { src: '/logo/sonar.png', alt: 'Sonar Platinum' },
        ],
      },
    ],
  },
  {
    label: 'TechBridge Skills Hub',
    sublabel: 'Audio Production',
    items: [
      {
        icon: Users,
        year: '2020 to Present',
        title: 'Founded TechBridge Skills Hub',
        body: 'Digital skills training initiative for unemployed youth in Ilorin. Multiple successful cohorts with a high job placement rate.',
      },
      {
        icon: Star,
        year: '',
        title: 'African ChangeMakers Fellowship',
        body: 'Recognised through the African ChangeMakers Fellowship entrepreneurship programme.',
      },
    ],
  },
  {
    label: 'Certifications',
    items: [
      {
        icon: BadgeCheck,
        year: '',
        title: 'Certified African Social Venture Planner (CASVP)',
        body: 'Formal accreditation in social venture planning across African development contexts.',
      },
      {
        icon: Code,
        year: '2024',
        title: 'Full Stack Software Engineering',
        body: 'Certification in full stack development covering React, Node.js, databases and cloud deployment.',
      },
      {
        icon: BadgeCheck,
        year: '2024',
        title: 'Generative AI Certification',
        body: 'Certified in applied generative AI concepts and tools for professional use.',
      },
      {
        icon: BadgeCheck,
        year: '',
        title: 'Diploma in Audio System Engineering',
        body: 'Advanced study in audio system engineering principles and applications.',
      },
    ],
  },
  {
    label: 'Current Role',
    items: [
      {
        icon: Radio,
        year: '2018 to Present',
        title: 'Group Chief Engineer at Diamond FM',
        body: 'Overseeing broadcast operations for Diamond 88.7 FM in Ilorin and Diamond 88.5 FM in Ilesa.',
      },
    ],
  },
];

export default function AchievementsPage() {
  const [popupItem, setPopupItem] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const { hash } = useLocation();

  useEffect(() => {
    const validIds = ['icfj-award', 'nbma-award', 'broadcast-engineering', 'kwara-tv', 'kwara-commission', 'audio-production', 'radio-netherlands'];
    const id = validIds.find(v => hash === `#${v}`) ?? null;
    if (id) {
      setHighlightId(id);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      setTimeout(() => {
        setHighlightId(null);
        const item = sections.flatMap(s => s.items).find(i => i.id === id);
        if (item?.popup) setPopupItem(item);
      }, 3000);
    }
  }, [hash]);

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 scale-110"
        style={{ backgroundImage: 'url(/h7.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top', filter: 'blur(3px)', zIndex: 0 }}
      />
      <div className="fixed inset-0 bg-white/90" style={{ zIndex: 1 }} />

      <style>{`
        @keyframes pulseGold {
          0%, 100% { box-shadow: 0 0 0 4px #f4b940, 0 0 50px rgba(244,185,64,0.9), 0 0 80px rgba(244,185,64,0.4); transform: scale(1.03); }
          50%       { box-shadow: 0 0 0 7px #f4b940, 0 0 80px rgba(244,185,64,1),   0 0 120px rgba(244,185,64,0.6); transform: scale(1.04); }
        }
        .icfj-highlight { animation: pulseGold 0.9s ease-in-out infinite; }
        @keyframes scrollLogos {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .logo-scroll-track { animation: scrollLogos 14s linear infinite; }
      `}</style>

      {/* Popup modal */}
      {popupItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setPopupItem(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {popupItem.bgImage && (
              <div
                className="absolute inset-0"
                style={{ backgroundImage: `url("${popupItem.bgImage}")`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: popupItem.bgOpacity ?? 0.25, filter: `blur(${popupItem.bgBlur ?? 4}px)`, transform: 'scale(1.05)' }}
              />
            )}
            <div className="relative z-10">
              <button
                onClick={() => setPopupItem(null)}
                className="absolute top-4 right-4 text-xl font-bold leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
              <div className="w-10 h-10 bg-[#f4b940] rounded-lg flex items-center justify-center mb-4">
                <Trophy size={20} className="text-black" />
              </div>
              <h3 className="text-base font-bold mb-3 text-gray-900">{popupItem.title}</h3>
              <div className="w-12 h-0.5 bg-[#f4b940] mb-4" />
              {popupItem.popup.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm leading-relaxed mb-3 text-gray-600">{para}</p>
              ))}
              {popupItem.url && (
                <a href={popupItem.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 mb-3 text-sm font-semibold text-[#f4b940] hover:underline">
                  View on ICFJ →
                </a>
              )}
              {popupItem.logos && (
                <div className="mt-4 overflow-hidden">
                  <div className="logo-scroll-track flex gap-8 w-max">
                    {[...popupItem.logos, ...popupItem.logos].map((logo, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 shrink-0 min-w-[72px]">
                        <img src={logo.src} alt={logo.alt} className="h-10 w-10 object-contain" />
                        <span className="text-xs text-gray-400 whitespace-nowrap">{logo.alt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="relative py-24" style={{ zIndex: 2 }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Recognition</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Milestones</h2>
            <div className="w-20 h-1 bg-[#f4b940] mx-auto mb-4" />
            <p className="text-gray-600 text-sm max-w-xl mx-auto">Key achievements across a 15 year career in broadcast engineering, technology and social impact.</p>
          </div>

          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.label}>
                <div className="mb-5">
                  <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.2em]">{section.label}</p>
                  {section.sublabel && <p className="text-gray-400 text-xs mt-0.5">{section.sublabel}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, i) => {
                    const Icon = item.icon;
                    const clickable = !!item.popup;
                    return (
                      <div
                        key={i}
                        id={item.id || undefined}
                        onClick={clickable ? () => setPopupItem(item) : undefined}
                        className={`group bg-white/80 backdrop-blur-sm rounded-lg p-5 transition-all duration-300 flex gap-4 ${clickable ? 'cursor-pointer' : ''} ${highlightId === item.id ? 'icfj-highlight z-10 relative' : 'shadow-[0_20px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)]'}`}
                      >
                        <div className="w-11 h-11 bg-[#f4b940] rounded-lg flex items-center justify-center shrink-0">
                          <Icon size={20} className="text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#f4b940] transition-colors duration-300">{item.title}</h3>
                            {item.year && <span className="text-xs text-[#f4b940] font-semibold shrink-0 whitespace-nowrap">{item.year}</span>}
                          </div>
                          <div className="w-8 h-0.5 bg-[#f4b940] mb-2" />
                          <p className="text-xs text-gray-600 leading-relaxed">{item.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

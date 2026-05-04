import { Award, Mic, Star, Users, BookOpen, Code, Radio, BadgeCheck } from 'lucide-react';

const sections = [
  {
    label: 'Industry Awards & Recognition',
    items: [
      {
        icon: Award,
        year: '2018',
        title: '2nd Place ICFJ Awards',
        body: 'For a climate migration documentary. Recognised by the International Center for Journalists in Washington D.C.',
      },
      {
        icon: Mic,
        year: '2013',
        title: 'Nigerian Broadcasters Merit Award',
        body: 'Best Radio Imaging North Central. Presented by the Nigerian Broadcasting Commission at Royal FM.',
      },
    ],
  },
  {
    label: 'High-Impact Projects',
    items: [
      {
        icon: Star,
        year: '',
        title: 'Kwara TV Rebranding Project',
        body: 'Led the full rebranding of Kwara TV, extending its reach to an audience of 4 million viewers.',
      },
      {
        icon: Star,
        year: '2013',
        title: 'Kwara State Government Commission',
        body: 'Designed and produced the Kwara TV station theme and full broadcast identity package, now reaching 4 million+ viewers statewide.',
      },
      {
        icon: Radio,
        year: '2014 to 2018',
        title: 'Radio Netherlands Worldwide',
        body: 'Selected across 4 editions of the African Development Exchange Programme for exceptional broadcast journalism on African development themes.',
      },
      {
        icon: BookOpen,
        year: '15+ yrs',
        title: 'Broadcast Engineering Experience',
        body: 'Over 15 years of broadcast engineering experience spanning multiple stations across Nigeria.',
      },
      {
        icon: Mic,
        year: '2015',
        title: 'Political Campaign Audio Production',
        body: 'Produced 5 political advocacy tracks for the Kwara State gubernatorial reelection campaign that contributed to a successful electoral outcome.',
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
  return (
    <div className="relative min-h-screen">
      {/* IMG_4968.PNG blended with white */}
      <div
        className="fixed inset-0 scale-110"
        style={{
          backgroundImage: 'url(/h7.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'blur(3px)',
          zIndex: 0,
        }}
      />
      <div className="fixed inset-0 bg-white/90" style={{ zIndex: 1 }} />

      <section className="relative py-24" style={{ zIndex: 2 }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Heading */}
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
                  {section.sublabel && (
                    <p className="text-gray-400 text-xs mt-0.5">{section.sublabel}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 flex gap-4"
                      >
                        <div className="w-11 h-11 bg-[#f4b940] rounded-lg flex items-center justify-center shrink-0">
                          <Icon size={20} className="text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="text-sm font-bold text-gray-900 leading-snug">{item.title}</h3>
                            {item.year && (
                              <span className="text-xs text-[#f4b940] font-semibold shrink-0 whitespace-nowrap">{item.year}</span>
                            )}
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

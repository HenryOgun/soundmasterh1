import { useState } from 'react';

export default function AboutPage() {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      {/* Hero */}
      <section className="bg-blue-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">The Story</p>
          <h1 className="text-4xl font-bold mb-4">About Henry Ogun</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto mb-6" />
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">Group Chief Engineer · Full Stack Developer · Audio Producer</p>
        </div>
      </section>

      {/* Pull Quote */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <blockquote className="border-l-4 border-[#f4b940] pl-8">
            <p className="text-2xl text-gray-800 italic leading-relaxed font-light">
              "I build things that communicate, whether that's a broadcast signal reaching millions, a documentary that wins international recognition, or software that solves real problems."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Who I Am + Photo */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: 'url(/h09.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px)',
          }}
        />
        <div className="absolute inset-0 bg-white/90" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 space-y-5 text-gray-600 leading-relaxed">
              <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em]">Who I Am</p>
              <h2 className="text-2xl font-bold text-gray-900">Engineer. Storyteller. Builder.</h2>
              <p>
                I am Henry Olabode Ogun known professionally as <strong className="text-gray-900">SoundMasterH1</strong>, a broadcast engineering professional with over 15 years of experience shaping how radio and television reach audiences across Nigeria. Based in Ilorin, Kwara State, I currently serve as <strong className="text-gray-900">Group Chief Engineer at Diamond FM</strong>, overseeing broadcast operations at Diamond 88.7 FM in Ilorin and Diamond 88.5 FM in Ilesa.
              </p>
              <p>
                My career sits at a rare intersection: the rigour of broadcast systems engineering and the creativity of audio production, multimedia storytelling and full stack software development. I do not just maintain infrastructure. I build it from concept to live transmission, lead the teams behind it and increasingly write the code that powers the digital layer on top.
              </p>
              <p>
                My broadcast career began in the early 2000s, evolving from IT infrastructure work including World Bank funded projects in Kwara State into professional sound engineering and broadcast production. At Royal FM 95.1 in Ilorin, I spent seven years building a career defined by technical excellence and creative ambition. This included managing digital music libraries, designing audio production workflows and producing documentaries that caught international attention.
              </p>
              <p>
                In 2018, a documentary series I produced on climate and migration in Nigeria was recognised with a <strong className="text-gray-900">2nd place award at the ICFJ International Journalism Awards</strong>. Since 2021, as Group Chief Engineer at Diamond FM, I have pioneered complete broadcast infrastructure setups from concept to live transmission and expanded multi-site engineering operations, growing the station's reach to over 4 million listeners.
              </p>
            </div>
            <div className="w-full lg:w-64 shrink-0">
              <img
                src="/IMG_4968.PNG"
                alt="Henry Ogun"
                className="w-full rounded-lg object-cover shadow-[0_20px_20px_rgba(0,0,0,0.1)]"
                style={{ aspectRatio: '4/5' }}
                onError={(e) => { e.target.src = '/without-the-name.png'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {[
              { number: '15+', label: 'Years in Broadcast' },
              { number: '2', label: 'FM Stations Led' },
              { number: '4M+', label: 'Listeners Reached' },
              { number: '3', label: 'Industry Awards' },
            ].map((stat) => (
              <div key={stat.label} className="py-10 px-6 text-center">
                <span className="block text-4xl font-bold text-[#f4b940] mb-1">{stat.number}</span>
                <span className="block text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlight Band */}
      <section className="bg-blue-900 py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <p className="text-xl text-white/90 italic leading-relaxed font-light text-center">
            "Broadcast engineering gave me precision. Software development gave me new tools. Together, they let me build systems that are both technically sound and genuinely impactful."
          </p>
          <p className="text-center text-[#f4b940] text-xs font-bold uppercase tracking-widest mt-6">Henry Olabode Ogun</p>
        </div>
      </section>

      {/* Show more toggle */}
      {!expanded && (
        <div className="text-center py-10 bg-[#f9f9f9]">
          <button
            onClick={() => setExpanded(true)}
            className="text-sm font-semibold text-[#f4b940] border border-[#f4b940] px-6 py-2 rounded hover:bg-[#f4b940] hover:text-black transition-all duration-300"
          >
            Show more
          </button>
        </div>
      )}

      {expanded && (
      <>
      {/* The Evolution */}
      <section className="py-24 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">The Evolution</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">A broadcast engineer who learned to code.</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              In 2024 and 2025, I made a deliberate expansion into software development, completing a Full Stack Software Engineering certification and a Generative AI programme. The decision was not a departure from broadcast engineering. It was a deepening of it. The most exciting opportunities in broadcast today live at the boundary between hardware systems and digital platforms and I intend to work across that boundary.
            </p>
            <p className="text-gray-600 leading-relaxed">
              My software work spans modern web frameworks, backend systems, database design and API development. These are skills I am actively applying to build tools, interfaces and products that serve the communities and industries I already understand deeply.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-t-2 border-[#f4b940]">
              <p className="text-[#f4b940] text-xs font-bold uppercase tracking-widest mb-3">Broadcast Engineering</p>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Systems Thinking at Scale</h3>
              <div className="w-10 h-0.5 bg-[#f4b940] mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed">Over 15 years designing, commissioning and managing broadcast infrastructure. From studio builds to live transmission across multiple sites in Nigeria.</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-t-2 border-[#f4b940]">
              <p className="text-[#f4b940] text-xs font-bold uppercase tracking-widest mb-3">Software Development</p>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Building for the Digital Layer</h3>
              <div className="w-10 h-0.5 bg-[#f4b940] mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed">Full stack development skills applied to real world products with the problem-solving instincts of an engineer who has worked under pressure for decades.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beyond the Work */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: 'url(/h09.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px)',
          }}
        />
        <div className="absolute inset-0 bg-white/90" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Beyond the Work</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Community. Creativity. Ubuntu.</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              In 2023, I founded <strong className="text-gray-900">TechBridge Skills Hub</strong>, a digital skills training social venture in Ilorin dedicated to equipping unemployed youth with practical, employable technology skills. The venture reflects a philosophy I carry into every professional context: that technology should uplift communities, not just optimise outputs.
            </p>
            <p>
              I serve as Secretary of the Audio/Visual Advisory Committee at Cherubim &amp; Seraphim Movement Church, Ilorin District Headquarters, applying my technical expertise in a community of faith. Away from the desk, I write, produce music and follow football with the same attention to craft I bring to my engineering work.
            </p>
          </div>
        </div>
      </section>

      {/* What I Do */}
      <section className="py-24 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Expertise</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What I Do</h2>
            <div className="w-20 h-1 bg-[#f4b940] mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { emoji: '🎛️', title: 'Broadcast Engineer', body: '15+ years in radio engineering, RF transmission, and studio infrastructure across multiple stations.' },
              { emoji: '💻', title: 'Full Stack Developer', body: 'React, Node.js, PostgreSQL and cloud platforms. Building tools for media and community.' },
              { emoji: '🎚️', title: 'Audio Production', body: 'Producing station IDs, jingles, promo spots and broadcast audio for radio and TV.' },
              { emoji: '🎵', title: 'Music Production', body: 'Composing, arranging and mixing original music from concept to final master.' },
            ].map((role) => (
              <div key={role.title} className="bg-white rounded-lg p-8 shadow-[0_20px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)] transition-all duration-300 text-center">
                <div className="text-3xl mb-4">{role.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{role.title}</h3>
                <div className="w-10 h-0.5 bg-[#f4b940] mx-auto mb-3" />
                <p className="text-sm text-gray-500 leading-relaxed">{role.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center py-10 bg-[#f9f9f9]">
        <button
          onClick={() => setExpanded(false)}
          className="text-sm font-semibold text-[#f4b940] border border-[#f4b940] px-6 py-2 rounded hover:bg-[#f4b940] hover:text-black transition-all duration-300"
        >
          Show less
        </button>
      </div>
    </>
  )}
  </>
  );
}

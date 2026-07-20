import { Link } from 'react-router-dom';
import HomeAchievements from './HomeAchievements';

const stats = [
  { value: '20+', label: 'Years in Broadcasting' },
  { value: '180+', label: 'Jingles & Station IDs' },
  { value: '4M+', label: 'Audience Reached' },
  { value: '3', label: 'Industry Awards' },
];

const specialisms = [
  'Broadcast Engineering',
  'Information Technology',
  'Audio Production',
  'Computer Repair & Networking',
  'Custom Software',
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center text-white overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 scale-105"
          style={{
            backgroundImage: 'url(/h5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(5px)',
          }}
        />
        {/* Rich gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/70 via-[#0d2045]/85 to-[#0a1628]/95" />

        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#f4b940] to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">

            {/* Profile photo */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-[#f4b940]/20 blur-2xl scale-105" />
              <img
                src="/IMG_5474.jpg"
                alt="Henry Ogun"
                className="relative w-44 h-52 rounded-2xl object-cover object-top ring-[3px] ring-[#f4b940]/60 shadow-2xl"
                onError={(e) => { e.target.src = '/henryogun-trans-new.png'; }}
              />
            </div>

            {/* Text content */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              {/* Label */}
              <p className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[#f4b940] text-[11px] font-bold uppercase tracking-[0.25em] mb-5">
                <span className="hidden sm:block w-6 h-px bg-[#f4b940]" />
                Broadcast Engineer · Developer · Audio Producer
                <span className="hidden sm:block w-6 h-px bg-[#f4b940]" />
              </p>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.08] mb-6 tracking-tight">
                Hello, I'm{' '}
                <span className="text-[#f4b940]">Henry.</span>
              </h1>

              {/* Sub */}
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl mb-3 font-light">
                I build the systems that put communities on air and the software that keeps them connected.
              </p>
              <p className="text-sm text-[#f4b940]/80 italic font-medium mb-10">
                Engineering the signal. Building the future. Heard around the world.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-10">
                <Link
                  to="/services"
                  className="px-8 py-3 bg-[#f4b940] hover:bg-yellow-400 text-black text-sm font-bold rounded-lg transition-all duration-200 shadow-lg shadow-[#f4b940]/20 hover:shadow-[#f4b940]/40 hover:-translate-y-0.5"
                >
                  View Services
                </Link>
                <Link
                  to="/booking"
                  className="px-8 py-3 border border-white/30 hover:border-[#f4b940] hover:text-[#f4b940] text-white text-sm font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5"
                >
                  Book a Session
                </Link>
              </div>

              {/* Specialism tags */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {specialisms.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-medium border border-white/15 text-white/60 backdrop-blur-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-[#f4b940]">{value}</p>
                <p className="text-xs text-white/50 mt-0.5 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent" />
      </section>

      {/* ── ACHIEVEMENTS ──────────────────────────────── */}
      <HomeAchievements />
    </>
  );
}

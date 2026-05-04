import HomeAchievements from './HomeAchievements';

export default function HomePage() {
  return (
    <>
      {/* Hero — black full section, 75vh */}
      <section className="relative text-white py-16 overflow-hidden">
        {/* Blurred background image */}
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: 'url(/h5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(4px)',
          }}
        />
        {/* Blue overlay for readability */}
        <div className="absolute inset-0 bg-blue-900/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <img
            src="/IMG_4967.PNG"
            alt="Henry Ogun"
            className="w-40 h-40 rounded-full object-cover mx-auto mb-6 ring-[7px] ring-[#f4b940] shadow-[0_0_50px_rgba(244,185,64,0.6)]"
            onError={(e) => { e.target.src = '/without-the-name.png'; }}
          />
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.3em] mb-3">
            Welcome
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-4 cursor-default transition-all duration-500 hover:text-[#f4b940] hover:tracking-wide hover:drop-shadow-[0_0_20px_rgba(244,185,64,0.5)]">
            Hello, I'm Henry.
          </h1>
          <p className="text-lg font-normal text-white leading-relaxed max-w-2xl mx-auto mb-3">
            I build broadcast systems that connect communities and software that powers the future.
            Based in Ilorin, Nigeria, I work at the intersection of sound, technology and innovation.
          </p>
          <p className="text-[#f4b940] italic font-medium text-sm mb-7">
            Keeping Africa's airwaves alive, one transmission at a time.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['🎛️ Broadcast Engineering', '💻 Full Stack Dev', '🌍 Digital Africa', '🎚️ Audio Production'].map((tag) => (
              <span key={tag} className="text-xs font-medium border border-white/30 text-white hover:border-[#f4b940] hover:text-[#f4b940] px-4 py-2 rounded transition-colors duration-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <HomeAchievements />
    </>
  );
}

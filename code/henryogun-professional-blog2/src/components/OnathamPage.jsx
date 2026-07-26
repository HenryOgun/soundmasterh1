import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio, Server, BarChart3, ArrowRight, Check, X,
  ShieldCheck, Zap, Globe2,
} from 'lucide-react';
import GetInTouchModal from './GetInTouchModal';

/* ─────────────────────────── DATA ─────────────────────────── */


const suiteProducts = [
  {
    icon: Radio,
    name: 'Henolla Playout',
    sub: 'On-Air Automation',
    accent: '#1565c0',
    desc: 'Live rundown, clock-based scheduling, drag-and-drop playlist, jingle carts, and real-time multi-studio sync. Everything a presenter needs — nothing they don\'t.',
    highlights: ['Clock-based automation', 'Drag-and-drop rundown', 'Multi-studio sync', 'Instant advert tracking'],
  },
  {
    icon: Server,
    name: 'Henolla Server',
    sub: 'Media Management',
    accent: '#4338ca',
    desc: 'Central audio library and connection hub for your entire station network. Upload once, access everywhere — music, jingles, adverts, all organised.',
    highlights: ['Centralised audio library', 'Role-based staff access', 'Real-time data sync', 'Web-based dashboard'],
  },
  {
    icon: BarChart3,
    name: 'Henolla Traffic',
    sub: 'Ad Sales & Scheduling',
    accent: '#c2410c',
    desc: 'Full advert traffic and campaign management. From client onboarding to proof-of-performance — your revenue operation, fully in control.',
    highlights: ['Campaign calendar & slot grid', 'Auto advert distribution', 'Expiry alerts', 'Proof-of-performance reports'],
  },
];

const pillars = [
  { icon: ShieldCheck, label: 'Runs Offline', desc: 'No internet dependency in the studio. Your broadcast never stops.' },
  { icon: Zap,         label: 'No Monthly Fees', desc: 'One price. Yours forever. No subscriptions, no surprises.' },
  { icon: Globe2,      label: 'Local Support', desc: 'Same timezone. Real people. Fast response when it matters.' },
];



const comparison = [
  { other: '$2,000–$5,000 / year in USD',            henolla: '₦1,600,000 one-time payment' },
  { other: 'Built for Western markets',               henolla: 'Built for any station, anywhere' },
  { other: 'Foreign support, different timezone',     henolla: 'Local support, same timezone' },
  { other: 'Complex setup, specialist hardware',      henolla: 'Standard Windows PC hardware' },
  { other: 'Separate, disconnected tools',            henolla: 'Playout + Server + Traffic unified' },
  { other: 'Requires internet to function',           henolla: 'Runs fully offline' },
];

/* ─────────────────────────── COMPONENT ─────────────────────────── */

export default function OnathamPage() {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      {showContact && <GetInTouchModal onClose={() => setShowContact(false)} />}

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative bg-[#08142a] overflow-hidden min-h-[92vh] flex items-center">
        {/* Grid texture */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Gold radial glow */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-[0.07] blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f4b940 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-20">

            {/* Left */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 bg-[#f4b940]/10 border border-[#f4b940]/25 text-[#f4b940] text-[11px] font-bold uppercase tracking-[0.22em] px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-[#f4b940] rounded-full" />
                RC No. 9601836 · Onatham Technologies Limited
              </div>

              <h1 className="text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-[-0.02em] mb-2">
                Broadcast.<br />Software.
              </h1>
              <h1 className="text-6xl md:text-7xl font-black italic text-[#f4b940] leading-[1.05] tracking-[-0.02em] mb-10">
                Digital Solutions.
              </h1>

              <p className="text-gray-400 text-xl leading-relaxed max-w-lg mb-12 border-l-4 border-[#f4b940]/40 pl-5">
                From radio automation and studio builds to websites, custom software, and technical support —
                everything your station or business needs to run with precision.
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/booking')}
                  className="group inline-flex items-center gap-2.5 bg-[#f4b940] hover:bg-yellow-400 text-black font-bold px-9 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-[#f4b940]/20 hover:-translate-y-0.5 text-base">
                  Book a Consultation
                  <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={() => setShowContact(true)}
                  className="inline-flex items-center gap-2.5 border border-white/15 hover:border-[#f4b940]/60 hover:text-[#f4b940] text-white/80 font-semibold px-9 py-4 rounded-xl transition-all duration-200 text-base">
                  Get In Touch
                </button>
              </div>
            </div>

            {/* Right — branded card */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="relative bg-[#08142a] rounded-3xl p-10 text-center shadow-2xl border-2 border-[#f4b940] max-w-[340px] mx-auto lg:mx-0">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f4b940] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                  Professional Broadcast & Digital Solutions
                </div>
                <img src="/logo/onatham 2.png" alt="Onatham Technologies" className="w-72 mx-auto mt-4 mb-6 object-contain" />
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
                <p className="text-[#f4b940] font-black text-2xl leading-tight tracking-tight">Engineered for Excellence.</p>
                <p className="text-white font-black text-2xl leading-tight tracking-tight mt-1">Built for Everyone.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHO WE ARE / COMPANY PROFILE
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="text-5xl font-black text-[#08142a] leading-[1.1] tracking-tight">
                Who We Are<br />Company Profile
              </h2>
              <p className="text-gray-400 text-sm">RC No. 9601836 — Onatham Technologies Limited</p>
            </div>
            <div className="w-16 h-1 bg-[#f4b940] mt-6" />
          </div>

          {/* About + Mission/Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14">
            {/* About */}
            <div>
              <p className="text-gray-600 text-base leading-relaxed mb-5">
                Onatham Technologies Limited is a Nigerian-registered technology company delivering broadcast software, studio infrastructure, audio production, web development, and custom digital solutions for radio stations and businesses.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-5">
                Founded and led by Henry Olabode Ogun — Director and Lead Developer — the company was built on over two decades of hands-on experience in broadcast engineering, information technology, and audio production.
              </p>
              <p className="text-gray-500 text-base leading-relaxed">
                Onatham exists to close the gap between world-class broadcast technology and the practical realities of running a media business in Nigeria — delivering solutions that are professional, affordable, and built to last.
              </p>
            </div>

            {/* Mission, Vision & Stats */}
            <div className="flex flex-col gap-5">
              <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50">
                <p className="text-[#f4b940] text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Our Mission</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To make professional-grade broadcast technology accessible, affordable, and sustainable for radio stations and media organisations of every size — without compromising on quality or reliability.
                </p>
              </div>
              <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50">
                <p className="text-[#f4b940] text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Our Vision</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To be the most trusted broadcast technology partner across Africa — known for software that works, support that responds, and solutions engineered for the real world.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HENOLLA SUITE
      ══════════════════════════════════════════════ */}
      <section className="bg-[#08142a] py-28 relative overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f4b940 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-4">Featured Product Suite</p>
              <h2 className="text-5xl font-black text-white leading-tight">The Henolla Suite</h2>
              <p className="text-gray-500 text-lg mt-3 max-w-md">Three integrated tools. One complete broadcast operation.</p>
            </div>
            {/* Pricing badge */}
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-right">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Complete Suite</p>
              <p className="text-[#f4b940] text-4xl font-black">₦1,600,000</p>
              <p className="text-green-400 text-sm font-bold mt-1">Under $1,000 USD</p>
              <p className="text-gray-600 text-xs mt-1">Runs offline · No monthly fees</p>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] border border-white/[0.06] rounded-2xl mb-10">
            {pillars.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 px-8 py-6">
                <div className="w-10 h-10 bg-[#f4b940]/10 border border-[#f4b940]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} className="text-[#f4b940]" />
                </div>
                <div>
                  <p className="text-white font-bold text-[15px]">{label}</p>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Product cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {suiteProducts.map(({ icon: Icon, name, sub, accent, desc, highlights }) => (
              <div key={name}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 group">
                <div className="px-7 pt-7 pb-6 border-b border-white/[0.06]">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: accent + '22', border: `1px solid ${accent}44` }}>
                    <Icon size={22} style={{ color: accent === '#c2410c' ? '#fb923c' : accent === '#1565c0' ? '#60a5fa' : '#818cf8' }} />
                  </div>
                  <h3 className="text-white text-xl font-black">{name}</h3>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">{sub}</p>
                </div>
                <div className="px-7 py-6">
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{desc}</p>
                  <ul className="space-y-2.5">
                    {highlights.map(h => (
                      <li key={h} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <Check size={13} className="text-[#f4b940] flex-shrink-0" />{h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-2 bg-[#f4b940] hover:bg-yellow-400 text-black font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#f4b940]/20 hover:-translate-y-0.5">
              Get the Henolla Suite <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMPARISON
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-4">Why Henolla Suite?</p>
            <h2 className="text-4xl font-black text-[#08142a] mb-5">Other Software vs Henolla Suite</h2>
            <div className="w-16 h-1 bg-[#f4b940] mx-auto" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#08142a]">
                  <th className="text-left px-7 py-4 font-semibold text-gray-400 text-xs uppercase tracking-widest w-1/2">Other Software</th>
                  <th className="text-left px-7 py-4 font-semibold text-[#f4b940] text-xs uppercase tracking-widest w-1/2">Henolla Suite</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-7 py-4 border-b border-gray-100 text-gray-400">
                      <span className="inline-flex items-center gap-2.5">
                        <X size={13} className="text-red-400 flex-shrink-0" />{row.other}
                      </span>
                    </td>
                    <td className="px-7 py-4 border-b border-gray-100 text-teal-700 font-semibold">
                      <span className="inline-flex items-center gap-2.5">
                        <Check size={13} className="text-teal-500 flex-shrink-0" />{row.henolla}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section className="relative bg-[#08142a] py-32 overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f4b940]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f4b940]/20 to-transparent" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.3em] mb-6">Get Started Today</p>
          <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
            Ready to elevate<br />your broadcast?
          </h2>
          <p className="text-gray-400 text-xl leading-relaxed mb-3 max-w-xl mx-auto">
            Whether you need a playout system, a new studio, a website, or custom software — let's build something exceptional together.
          </p>
          <p className="text-gray-600 text-sm mb-12">We respond within 24 hours.</p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button onClick={() => navigate('/booking')}
              className="group inline-flex items-center gap-2.5 bg-[#f4b940] hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl transition-all duration-200 shadow-2xl shadow-[#f4b940]/20 hover:-translate-y-0.5 text-base">
              Book a Consultation
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => setShowContact(true)}
              className="inline-flex items-center gap-2.5 border border-white/15 hover:border-[#f4b940]/50 hover:text-[#f4b940] text-white/80 font-semibold px-10 py-4 rounded-xl transition-all duration-200 text-base">
              Get In Touch
            </button>
          </div>

          <div className="border-t border-white/[0.08] pt-10 text-sm space-y-1.5">
            <p className="font-bold text-gray-300 text-base">Onatham Technologies Limited</p>
            <p className="text-gray-500">RC No. 9601836</p>
            <p className="text-gray-500">help@henryogun.com · +234 806 077 6418</p>
            <p className="text-[#f4b940] font-bold mt-2">www.henryogun.com</p>
          </div>
        </div>
      </section>
    </>
  );
}

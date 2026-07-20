import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Cpu, Mic2, Wrench, Code2, RadioTower, ArrowRight, Quote } from 'lucide-react';
import GetInTouchModal from './GetInTouchModal';

const services = [
  {
    icon: Radio,
    title: 'Radio Playout Software',
    desc: 'Custom-built playout systems for radio stations including scheduling, automation, jingle management, and live assist tools tailored to your station.',
  },
  {
    icon: RadioTower,
    title: 'Broadcast Consulting & Studio Setup',
    desc: 'End-to-end consulting covering signal chain, studio workflow, acoustic treatment, equipment selection, cabling, and commissioning for broadcast and home studios.',
  },
  {
    icon: Mic2,
    title: 'Audio Production & Jingles',
    desc: 'Professional jingles, station IDs, voice-overs, and audio branding packages that give your station a distinct and memorable sound.',
  },
  {
    icon: Code2,
    title: 'Web Development',
    desc: 'Modern, responsive websites built for businesses, organisations, and personal brands. Clean design, fast performance, and built to represent you well online.',
  },
  {
    icon: Cpu,
    title: 'Custom Software Development',
    desc: 'Bespoke management tools, automation scripts, and web apps built for broadcast facilities, businesses, and community organisations.',
  },
  {
    icon: Wrench,
    title: 'Computer Repair & Networking',
    desc: 'Hardware diagnostics, repair, and MikroTik network setup for broadcast facilities, offices, and homes across Kwara State.',
  },
];

const testimonials = [
  {
    name: 'Badewa Adeyemi',
    role: 'Station Manager, Diamond FM',
    quote: 'Henry built us a playout system that transformed how we run our station. Reliable, intuitive, and always available when we need support.',
  },
  {
    name: 'Dr Femi Akorede',
    role: 'Director, Kwara State Government',
    quote: 'The studio setup was done professionally and on schedule. Henry understood exactly what we needed and delivered beyond our expectations.',
  },
  {
    name: 'Olayinka Oladipo',
    role: 'CEO, Aqualife Initiative',
    quote: 'Henry built our website and it came out exactly as we envisioned. Professional, clean, and delivered on time. We couldn\'t be happier with the result.',
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      {showContact && <GetInTouchModal onClose={() => setShowContact(false)} />}
      {/* Hero */}
      <section className="bg-[#08142a] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">What I Offer</p>
          <h1 className="text-4xl font-bold mb-4">Services</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto mb-6" />
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            From radio playout systems to studio builds, audio production to custom software — everything you need to sound professional and run efficiently.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group border border-gray-100 rounded-xl p-8 hover:shadow-lg hover:border-[#f4b940] transition-all duration-300">
                <div className="w-12 h-12 bg-[#f4b940] rounded-lg flex items-center justify-center mb-5">
                  <Icon size={22} className="text-black" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Client Feedback</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Testimonials</h2>
            <div className="w-16 h-1 bg-[#f4b940] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, quote }) => (
              <div key={name + role} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <Quote size={28} className="text-[#f4b940] mb-4" />
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{quote}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#08142a] text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to work together?</h2>
          <p className="text-gray-300 mb-8">Book a session or send a quick message and let's talk about your project.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-2 bg-[#f4b940] hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Book a Session <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="inline-flex items-center gap-2 border border-white/30 hover:border-[#f4b940] hover:text-[#f4b940] text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200"
            >
              Get In Touch
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

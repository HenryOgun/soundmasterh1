import { useNavigate } from 'react-router-dom';
import { Linkedin, Twitter, Youtube, Mail, Github, Facebook, ArrowRight } from 'lucide-react';

const socials = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/henryogun' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/henryogun' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/soundmasterh1' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@soundmasterh1339' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/soundmasterh1' },
  { icon: Mail, label: 'Email', href: 'mailto:help@henryogun.com' },
];

const links = [
  { label: 'Services', path: '/services' },
  { label: 'Book a Session', path: '/booking' },
  { label: 'Projects', path: '/projects/broadcast' },
  { label: 'Articles', path: '/articles' },
  { label: 'About', path: '/about' },
  { label: 'Achievements', path: '/achievements' },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#08142a] text-white">
      {/* Gold accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#f4b940] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img src="/henryogun-trans-new.png" alt="Henry Ogun" className="w-10 h-10 object-contain" />
              <div>
                <p className="font-bold text-white text-base leading-tight">Henry Ogun</p>
                <p className="text-[10px] font-bold text-[#f4b940] tracking-[0.2em] uppercase">SoundMasterH1</p>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-6">
              Broadcast Engineer · Full-Stack Developer · Audio Producer.<br />Based in Ilorin, Kwara State, Nigeria.
            </p>
            <div className="flex flex-wrap gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" title={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-[#f4b940] hover:text-black hover:border-[#f4b940] transition-all duration-200">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4b940] mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {links.map(({ label, path }) => (
                <li key={label}>
                  <button onClick={() => navigate(path)}
                    className="text-sm text-white/50 hover:text-[#f4b940] transition-colors flex items-center gap-1.5 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f4b940] mb-5">Work With Me</h4>
            <p className="text-sm text-white/50 leading-relaxed mb-5">
              Available for broadcast consulting, studio setups, audio production, and custom software projects.
            </p>
            <button onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f4b940] hover:bg-yellow-400 text-black text-[13px] font-bold rounded-lg transition-all duration-200 hover:-translate-y-px">
              Book a Session <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2026 Henry Ogun. All rights reserved.</p>
          <p className="text-xs text-white/30 italic">Engineering the signal. Building the future. Heard around the world.</p>
        </div>
      </div>
    </footer>
  );
}

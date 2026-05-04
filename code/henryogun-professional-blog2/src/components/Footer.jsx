import { Linkedin, Twitter, Youtube, Mail, Github, Facebook } from 'lucide-react';

const socials = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/henryogun' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/henryogun' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/soundmasterh1' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@soundmasterh1339' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/soundmasterh1' },
  { icon: Mail, label: 'Email', href: 'mailto:help@henryogun.com' },
];


export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/without-the-name.png" alt="Henry Ogun" className="w-11 h-11 object-contain" />
              <div>
                <p className="font-extrabold text-white leading-tight">Henry Ogun</p>
                <p className="text-xs font-bold text-gray-300">SoundMasterH1</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Broadcast Engineer · Full-Stack Developer · Audio Producer. Based in Ilorin, Kwara State, Nigeria.
            </p>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4b940] mb-4">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" title={label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-[#f4b940] hover:text-black transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white font-bold">© 2026 Henry Ogun. All rights reserved.</p>
          <p className="text-xs text-white italic">Engineering the signal. Building the future. Heard around the world.</p>
        </div>
      </div>
    </footer>
  );
}

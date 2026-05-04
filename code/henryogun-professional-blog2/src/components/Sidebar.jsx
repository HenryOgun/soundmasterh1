import { useState } from 'react';
import { Linkedin, Github, Twitter, Youtube, Mail, Facebook } from 'lucide-react';

const socials = [
  { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-600', href: 'https://linkedin.com/in/henryogun' },
  { icon: Github, label: 'GitHub', color: 'hover:text-gray-900', href: 'https://github.com/henryogun' },
  { icon: Twitter, label: 'Twitter / X', color: 'hover:text-sky-500', href: 'https://twitter.com/soundmasterh1' },
  { icon: Youtube, label: 'YouTube', color: 'hover:text-red-600', href: 'https://www.youtube.com/@soundmasterh1339' },
  { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-500', href: 'https://www.facebook.com/soundmasterh1' },
  { icon: Mail, label: 'Email', color: 'hover:text-indigo-600', href: 'mailto:help@henryogun.com' },
];

export default function Sidebar() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  return (
    <div className="space-y-8">
      {/* Profile card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
        <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-4 ring-4 ring-indigo-300 shadow-lg">
          <img
            src="/h7.jpg"
            alt="Henry Ogun"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/without-the-name.png'; }}
          />
        </div>
        <h2 className="text-base font-bold text-gray-900">Henry Ogun</h2>
        <p className="text-xs text-indigo-600 font-semibold mt-0.5 mb-3">SoundMasterH1</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Broadcast Engineer, Full-Stack Developer, and Digital Innovator based in Ilorin, Nigeria.
          ICFJ Knight Award winner. Founder of TechBridge Skills Hub.
        </p>
        <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
          <span>📍</span> Ilorin, Kwara State, Nigeria
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          {socials.map(({ icon: Icon, label, color, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" title={label}
              className={`text-gray-400 transition-colors ${color}`}>
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Newsletter</h3>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Get articles on broadcast engineering, tech education, and digital Africa, direct to your inbox.
        </p>
        {subscribed ? (
          <p className="text-xs text-emerald-600 font-semibold text-center py-2">Thanks for subscribing!</p>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" required
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
            <button type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
              Subscribe
            </button>
          </form>
        )}
      </div>

      {/* Topics */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {['Broadcast Engineering', 'Full-Stack Dev', 'Tech Education', 'Nigeria Media', 'ICFJ', 'Community Radio', 'Digital Literacy', 'React', 'TechBridge'].map((tag) => (
            <span key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-indigo-100 hover:text-indigo-700 cursor-pointer transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

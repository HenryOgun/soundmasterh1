import { useState } from 'react';
import { X, Linkedin, Twitter, Youtube, Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

export default function GetInTouchModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `Name: ${form.name}%0AEmail: ${form.email}%0AMessage: ${form.message}`;
    window.open(`https://wa.me/2348060776418?text=${text}`, '_blank');
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header strip */}
        <div className="bg-blue-900 rounded-t-xl px-8 py-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-2">Let's Talk</p>
          <h2 className="text-2xl font-bold mb-3">Get In Touch</h2>
          <div className="w-16 h-0.5 bg-[#f4b940] mx-auto mb-4" />
          <p className="text-gray-300 text-sm max-w-md mx-auto">Available for collaborations, speaking engagements, and broadcast consulting.</p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            {sent ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-[#f4b940] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-black" />
                </div>
                <p className="font-bold text-gray-900 mb-1">Message sent via WhatsApp!</p>
                <p className="text-sm text-gray-500 mb-6">Henry will get back to you soon.</p>
                <button onClick={() => setSent(false)} className="text-sm text-[#f4b940] font-semibold hover:underline">
                  Send another
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900 mb-1">Send a Message</h3>
                <div className="w-10 h-0.5 bg-[#f4b940] mb-5" />
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="How can Henry help you?"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none transition-all" />
                  </div>
                  <button type="submit"
                    className="w-full bg-[#f4b940] hover:bg-[#e0a82e] text-black text-sm font-bold py-3 rounded-lg transition-colors duration-200">
                    Send via WhatsApp
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Contact details + social */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Direct Contact</h3>
              <div className="w-10 h-0.5 bg-[#f4b940] mb-4" />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-9 h-9 bg-[#f4b940] rounded-lg flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-black" />
                  </div>
                  <span>Ilorin, Kwara State, Nigeria</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-9 h-9 bg-[#f4b940] rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-black" />
                  </div>
                  <a href="mailto:help@henryogun.com" className="hover:text-[#f4b940] transition-colors">help@henryogun.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-9 h-9 bg-[#f4b940] rounded-lg flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-black" />
                  </div>
                  <a href="tel:+2348060776418" className="hover:text-[#f4b940] transition-colors">+234 806 077 6418</a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-1">Follow Along</h3>
              <div className="w-10 h-0.5 bg-[#f4b940] mb-4" />
              <div className="space-y-2">
                {[
                  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/henryogun' },
                  { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com/soundmasterh1' },
                  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@soundmasterh1339' },
                  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/soundmasterh1' },
                  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/soundmasterh1' },
                ].map(({ icon: Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#f4b940] transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-[#f4b940] group-hover:border-[#f4b940] flex items-center justify-center shrink-0 transition-all">
                      <Icon size={15} className="group-hover:text-black" />
                    </div>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

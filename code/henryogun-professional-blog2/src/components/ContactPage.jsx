import { useState } from 'react';
import { Linkedin, Twitter, Youtube, Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `Name: ${form.name}%0AEmail: ${form.email}%0AMessage: ${form.message}`;
    window.open(`https://wa.me/2348000000000?text=${text}`, '_blank');
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-blue-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Let's Talk</p>
          <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto mb-6" />
          <p className="text-gray-300 text-lg max-w-xl mx-auto">Available for collaborations, speaking engagements, and broadcast consulting.</p>
        </div>
      </section>

      {/* Form + Details */}
      <section className="relative py-24 overflow-hidden">
        {/* h9.jpg blended with white */}
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: 'url(/h9.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px)',
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-lg p-8 shadow-[0_20px_20px_rgba(0,0,0,0.05)]">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-[#f4b940] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Mail size={24} className="text-black" />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">Message sent via WhatsApp!</p>
                  <p className="text-sm text-gray-500 mb-6">Henry will get back to you soon.</p>
                  <button onClick={() => setSent(false)}
                    className="text-sm text-[#f4b940] font-semibold hover:underline">Send another</button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Send a Message</h2>
                  <div className="w-12 h-0.5 bg-[#f4b940] mb-6" />
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                      <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="How can Henry help you?"
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

            {/* Contact details */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-8 shadow-[0_20px_20px_rgba(0,0,0,0.05)]">
                <h3 className="font-bold text-gray-900 mb-1">Direct Contact</h3>
                <div className="w-12 h-0.5 bg-[#f4b940] mb-5" />
                <div className="space-y-4">
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

              <div className="bg-white rounded-lg p-8 shadow-[0_20px_20px_rgba(0,0,0,0.05)]">
                <h3 className="font-bold text-gray-900 mb-1">Follow Along</h3>
                <div className="w-12 h-0.5 bg-[#f4b940] mb-5" />
                <div className="space-y-3">
                  {[
                    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/henryogun' },
                    { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com/soundmasterh1' },
                    { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@soundmasterh1339' },
                    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/soundmasterh1' },
                    { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/soundmasterh1' },
                  ].map(({ icon: Icon, label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#f4b940] transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-[#f4b940] group-hover:border-[#f4b940] flex items-center justify-center shrink-0 transition-all">
                        <Icon size={16} className="group-hover:text-black" />
                      </div>
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

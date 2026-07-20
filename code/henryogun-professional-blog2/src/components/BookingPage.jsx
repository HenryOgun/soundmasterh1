import { useState } from 'react';
import { CheckCircle, Mail, MapPin, Phone, Linkedin, Twitter, Youtube, Instagram, Facebook } from 'lucide-react';

const FORMSPREE_ID = 'mbdnyejy';

const serviceOptions = [
  'Radio Playout Software',
  'Broadcast Consulting',
  'Studio Setup & Design',
  'Audio Production & Jingles',
  'Computer Repair & Networking',
  'Custom Software Development',
  'Web Development',
  'Other',
];

export default function BookingPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', budget: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [quick, setQuick] = useState({ name: '', email: '', message: '' });
  const [quickSent, setQuickSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleQuickChange = (e) => setQuick({ ...quick, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', phone: '', service: '', budget: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    const text = `Name: ${quick.name}%0AEmail: ${quick.email}%0AMessage: ${quick.message}`;
    window.open(`https://wa.me/2348060776418?text=${text}`, '_blank');
    setQuickSent(true);
    setQuick({ name: '', email: '', message: '' });
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-[#08142a] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Let's Work Together</p>
          <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto mb-6" />
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Fill in the booking form for a project enquiry, or send a quick message via WhatsApp.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* Booking form — takes 2 cols */}
            <div className="lg:col-span-2 bg-white rounded-xl p-10 shadow-sm border border-gray-100">
              {status === 'sent' ? (
                <div className="text-center py-10">
                  <CheckCircle size={48} className="text-[#f4b940] mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Request Sent!</h2>
                  <p className="text-gray-500 text-sm mb-6">Henry will get back to you within 24 hours.</p>
                  <button onClick={() => setStatus('idle')} className="text-sm text-[#f4b940] font-semibold hover:underline">
                    Submit another request
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Book a Session</h2>
                  <div className="w-12 h-0.5 bg-[#f4b940] mb-8" />

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Full Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name"
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email Address *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Phone Number</label>
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234 ..."
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Service Needed *</label>
                        <select name="service" value={form.service} onChange={handleChange} required
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all bg-white">
                          <option value="">Select a service</option>
                          {serviceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Budget Range (optional)</label>
                      <select name="budget" value={form.budget} onChange={handleChange}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all bg-white">
                        <option value="">Prefer not to say</option>
                        <option value="Under ₦100,000">Under ₦100,000</option>
                        <option value="₦100,000 – ₦500,000">₦100,000 – ₦500,000</option>
                        <option value="₦500,000 – ₦1,000,000">₦500,000 – ₦1,000,000</option>
                        <option value="Above ₦1,000,000">Above ₦1,000,000</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Project Details *</label>
                      <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                        placeholder="Describe your project or what you need help with..."
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none transition-all" />
                    </div>

                    {status === 'error' && (
                      <p className="text-red-500 text-sm">Something went wrong. Please try again or email <a href="mailto:help@henryogun.com" className="underline">help@henryogun.com</a> directly.</p>
                    )}

                    <button type="submit" disabled={status === 'sending'}
                      className="w-full bg-[#f4b940] hover:bg-yellow-400 disabled:opacity-60 text-black text-sm font-bold py-3 rounded-lg transition-colors duration-200">
                      {status === 'sending' ? 'Sending...' : 'Send Booking Request'}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Right column: quick message + contact info */}
            <div className="space-y-6">

              {/* Quick WhatsApp message */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                {quickSent ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-[#f4b940] rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Mail size={20} className="text-black" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">Sent via WhatsApp!</p>
                    <p className="text-sm text-gray-500 mb-4">Henry will reply soon.</p>
                    <button onClick={() => setQuickSent(false)} className="text-sm text-[#f4b940] font-semibold hover:underline">
                      Send another
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Quick Message</h3>
                    <div className="w-10 h-0.5 bg-[#f4b940] mb-5" />
                    <form onSubmit={handleQuickSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Name</label>
                        <input name="name" value={quick.name} onChange={handleQuickChange} required placeholder="Your name"
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email</label>
                        <input name="email" type="email" value={quick.email} onChange={handleQuickChange} required placeholder="your@email.com"
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Message</label>
                        <textarea name="message" value={quick.message} onChange={handleQuickChange} required rows={3} placeholder="How can Henry help?"
                          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4b940] focus:border-transparent resize-none transition-all" />
                      </div>
                      <button type="submit"
                        className="w-full bg-[#f4b940] hover:bg-yellow-400 text-black text-sm font-bold py-3 rounded-lg transition-colors duration-200">
                        Send via WhatsApp
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Contact details */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-5">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Direct Contact</h3>
                  <div className="w-10 h-0.5 bg-[#f4b940] mb-4" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-9 h-9 bg-[#f4b940] rounded-lg flex items-center justify-center shrink-0">
                        <MapPin size={15} className="text-black" />
                      </div>
                      Ilorin, Kwara State, Nigeria
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-9 h-9 bg-[#f4b940] rounded-lg flex items-center justify-center shrink-0">
                        <Mail size={15} className="text-black" />
                      </div>
                      <a href="mailto:help@henryogun.com" className="hover:text-[#f4b940] transition-colors">help@henryogun.com</a>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-9 h-9 bg-[#f4b940] rounded-lg flex items-center justify-center shrink-0">
                        <Phone size={15} className="text-black" />
                      </div>
                      <a href="tel:+2348060776418" className="hover:text-[#f4b940] transition-colors">+234 806 077 6418</a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Follow Along</h3>
                  <div className="w-10 h-0.5 bg-[#f4b940] mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: Linkedin, href: 'https://linkedin.com/in/henryogun', label: 'LinkedIn' },
                      { icon: Twitter, href: 'https://twitter.com/soundmasterh1', label: 'Twitter' },
                      { icon: Youtube, href: 'https://www.youtube.com/@soundmasterh1339', label: 'YouTube' },
                      { icon: Instagram, href: 'https://instagram.com/soundmasterh1', label: 'Instagram' },
                      { icon: Facebook, href: 'https://www.facebook.com/soundmasterh1', label: 'Facebook' },
                    ].map(({ icon: Icon, href, label }) => (
                      <a key={label} href={href} target="_blank" rel="noreferrer" title={label}
                        className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 hover:bg-[#f4b940] hover:border-[#f4b940] flex items-center justify-center text-gray-500 hover:text-black transition-all">
                        <Icon size={15} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

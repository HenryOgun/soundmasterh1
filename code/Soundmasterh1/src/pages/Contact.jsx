import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! I\'ll get back to you soon.');
  };

  const rates = [
    { service: 'Podcast Production', rate: '$150/hour' },
    { service: 'Music Mastering', rate: '$100/hour' },
    { service: 'Sound Design', rate: '$120/hour' },
    { service: 'Voice-over', rate: '$80/hour' },
    { service: 'Audiobook Production', rate: '$200/hour' },
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">Contact & Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Get In Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info & Rates */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Mail className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-400">henry@soundmasterh1.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Phone className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-gray-400">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <MapPin className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-gray-400">Los Angeles, CA</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Calendar className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="font-semibold">Availability</p>
                      <p className="text-gray-400">Mon-Fri, 9AM-6PM PST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rates */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Rates</h2>
                <div className="space-y-3">
                  {rates.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
                      <span>{item.service}</span>
                      <span className="text-purple-400 font-semibold">{item.rate}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  * Rates are starting points and may vary based on project complexity and requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
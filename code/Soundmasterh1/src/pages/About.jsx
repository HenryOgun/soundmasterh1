import React from 'react';
import { Award, Users, Headphones, Mic } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, label: 'Happy Clients', value: '50+' },
    { icon: Headphones, label: 'Projects Completed', value: '200+' },
    { icon: Award, label: 'Years Experience', value: '8+' },
    { icon: Mic, label: 'Audio Categories', value: '6' },
  ];

  const equipment = [
    'Neumann U87 Microphone',
    'Focusrite Scarlett Interface',
    'Pro Tools Software',
    'Waves Audio Plugins',
    'SSL Mixing Console',
    'Genelec Monitors',
    'Rode NT1 Microphone',
    'Universal Audio Hardware',
  ];

  const certifications = [
    'Certified Audio Engineer (AES)',
    'Pro Tools Expert Certification',
    'Mastering Engineer Certification',
    'Sound Design Professional',
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About SoundMasterH1</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Passionate audio engineer bridging the gap between technology and creative sound design.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Story */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">My Story</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-300 mb-4">
                  My journey into audio engineering began during my broadcast engineering studies,
                  where I discovered the power of sound to tell stories and evoke emotions.
                  What started as a technical curiosity evolved into a passionate career.
                </p>
                <p className="text-gray-300 mb-4">
                  Today, I specialize in creating immersive audio experiences across multiple mediums,
                  from podcast production to sound design for interactive media. My approach combines
                  technical expertise with creative vision to deliver exceptional results.
                </p>
              </div>
              <div>
                <img
                  src="https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Studio+Setup"
                  alt="Studio Setup"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Equipment & Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipment.map((item, index) => (
                <div key={index} className="bg-gray-900 p-4 rounded-lg">
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <div key={index} className="bg-gray-900 p-4 rounded-lg flex items-center">
                  <Award className="w-6 h-6 text-purple-500 mr-3" />
                  <span className="text-gray-300">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Studio Photo */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">My Studio</h2>
            <img
              src="https://via.placeholder.com/800x400/06B6D4/FFFFFF?text=Professional+Studio"
              alt="Professional Studio"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
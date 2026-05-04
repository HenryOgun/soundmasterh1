import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WaveformVisualizer from '../components/WaveformVisualizer';

const Home = () => {
  const [hoveredProject, setHoveredProject] = useState(null);

  const projects = [
    { id: 1, title: 'Podcast Production', category: 'podcasts', color: 'from-blue-500 to-cyan-500' },
    { id: 2, title: 'Music Mastering', category: 'music', color: 'from-purple-500 to-pink-500' },
    { id: 3, title: 'Sound Design', category: 'design', color: 'from-green-500 to-teal-500' },
    { id: 4, title: 'Voice-over Work', category: 'voice', color: 'from-orange-500 to-red-500' },
    { id: 5, title: 'Audiobook Narration', category: 'audiobooks', color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-900">
        <div className="text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: 'Oswald, sans-serif' }}>
            S<img src="/images/speaker (4).png" alt="speaker" className="inline-block w-16 h-16 md:w-20 md:h-20 object-contain mx-1 brightness-0 invert filter drop-shadow-lg" style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))' }} />un<span className="-ml-4 -mr-2 text-yellow-400" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700' }}>𝄞</span>masterH<img src="/images/man-talking-by-speaker.png" alt="1" className="inline-block w-16 h-16 md:w-20 md:h-20 object-contain mx-1 brightness-0 invert filter drop-shadow-lg" style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))' }} />
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-2xl mx-auto">
            Interactive Audio Portfolio - Where Sound Meets Innovation
          </p>

          {/* Waveform Interface */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-8">Featured Projects</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <div className={`w-32 h-32 bg-gradient-to-br ${project.color} rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    hoveredProject === project.id ? 'scale-110 shadow-2xl' : ''
                  }`}>
                    <WaveformVisualizer bars={8} isPlaying={hoveredProject === project.id} />
                    {hoveredProject === project.id && (
                      <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-center">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="absolute inset-0"
                    aria-label={`View ${project.title}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Link
              to="/projects"
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full flex items-center space-x-2 transition-colors"
            >
              <span>Explore All Projects</span>
            </Link>
            <Link
              to="/about"
              className="border border-purple-400 hover:bg-purple-400 hover:text-black px-8 py-3 rounded-full transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
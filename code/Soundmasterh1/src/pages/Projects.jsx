import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Download } from 'lucide-react';

const Projects = () => {
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'Tech Startup Podcast',
      category: 'podcasts',
      client: 'TechCorp',
      duration: '45 min',
      tools: ['Pro Tools', 'Neumann U87', 'Focusrite Scarlett'],
      description: 'Complete audio production for a weekly tech podcast.',
      image: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Podcast',
      audioSrc: '#', // Placeholder
    },
    {
      id: 2,
      title: 'Electronic Music Track',
      category: 'music',
      client: 'Indie Artist',
      duration: '3:24',
      tools: ['Logic Pro', 'Native Instruments', 'SSL Console'],
      description: 'Full production and mastering of an electronic music single.',
      image: 'https://via.placeholder.com/400x300/06B6D4/FFFFFF?text=Music',
      audioSrc: '#',
    },
    {
      id: 3,
      title: 'Sci-Fi Sound Design',
      category: 'design',
      client: 'Film Studio',
      duration: '2:15',
      tools: ['Pro Tools', 'Waves Plugins', 'Field Recorders'],
      description: 'Atmospheric sound design for a science fiction short film.',
      image: 'https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Sound+Design',
      audioSrc: '#',
    },
    {
      id: 4,
      title: 'Corporate Voice-over',
      category: 'voice',
      client: 'Global Corp',
      duration: '1:30',
      tools: ['Neumann U87', 'Audacity', 'iZotope RX'],
      description: 'Professional voice-over narration for corporate training video.',
      image: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Voice+Over',
      audioSrc: '#',
    },
    {
      id: 5,
      title: 'Mystery Audiobook',
      category: 'audiobooks',
      client: 'Publishing House',
      duration: '8:45',
      tools: ['Pro Tools', 'Rode NT1', 'Audacity'],
      description: 'Full audiobook production and editing.',
      image: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Audiobook',
      audioSrc: '#',
    },
  ];

  const categories = ['all', 'podcasts', 'music', 'design', 'voice', 'audiobooks'];

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="pt-20 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Project Showcase</h1>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full capitalize transition-colors ${
                filter === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
              <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-purple-400 mb-2">{project.category}</p>
                <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Duration: {project.duration}</span>
                  <span className="text-sm text-gray-500">Client: {project.client}</span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-center transition-colors"
                  >
                    View Details
                  </Link>
                  <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
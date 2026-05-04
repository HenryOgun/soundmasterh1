import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Music, Volume2, Radio, BookOpen, Users } from 'lucide-react';

const Categories = () => {
  const categories = [
    {
      id: 'podcasts',
      name: 'Podcasts',
      icon: Radio,
      description: 'Audio storytelling and interview productions',
      count: 12,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'music',
      name: 'Music Production',
      icon: Music,
      description: 'Full music production and mastering services',
      count: 8,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'design',
      name: 'Sound Design',
      icon: Volume2,
      description: 'Creative sound design for media and games',
      count: 15,
      color: 'from-green-500 to-teal-500',
    },
    {
      id: 'voice',
      name: 'Voice-overs',
      icon: Mic,
      description: 'Professional voice-over and narration work',
      count: 20,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'audiobooks',
      name: 'Audiobooks',
      icon: BookOpen,
      description: 'Complete audiobook production and editing',
      count: 6,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'corporate',
      name: 'Corporate Audio',
      icon: Users,
      description: 'Business presentations and training content',
      count: 10,
      color: 'from-gray-500 to-slate-500',
    },
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Audio Categories</h1>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Explore my work across different audio production categories.
          Each category represents a unique aspect of my audio engineering expertise.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                to={`/projects?category=${category.id}`}
                className="group bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-400 mb-4">{category.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-semibold">{category.count} Projects</span>
                  <span className="text-gray-500 group-hover:text-purple-400 transition-colors">
                    View →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;
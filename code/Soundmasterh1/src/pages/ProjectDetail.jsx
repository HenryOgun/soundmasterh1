import React from 'react';
import { useParams, Link } from 'react-router-dom';
import AudioPlayer from '../components/AudioPlayer';

const ProjectDetail = () => {
  const { id } = useParams();

  // Mock project data - in real app, fetch from API
  const project = {
    id: parseInt(id),
    title: 'Tech Startup Podcast',
    category: 'podcasts',
    client: 'TechCorp',
    duration: '45 min',
    tools: ['Pro Tools', 'Neumann U87', 'Focusrite Scarlett'],
    description: 'Complete audio production for a weekly tech podcast featuring interviews with startup founders and industry experts.',
    image: 'https://via.placeholder.com/800x400/8B5CF6/FFFFFF?text=Podcast+Detail',
    audioSrc: '#',
    behindTheScenes: 'This project involved careful planning of the recording setup to ensure crystal-clear audio for both the host and remote guests. We used a combination of studio microphones and high-quality interfaces to capture the conversation naturally.',
    tags: ['podcast', 'interview', 'tech', 'production'],
  };

  return (
    <div className="pt-20 pb-20">
      <div className="container mx-auto px-4">
        <Link to="/projects" className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <img src={project.image} alt={project.title} className="w-full rounded-lg mb-6" />
            <AudioPlayer
              src={project.audioSrc}
              title={project.title}
              artist={project.client}
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <div className="mb-6">
              <span className="bg-purple-600 px-3 py-1 rounded-full text-sm capitalize">
                {project.category}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Project Details</h3>
                <p className="text-gray-300">{project.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Client</h4>
                <p className="text-gray-400">{project.client}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Duration</h4>
                <p className="text-gray-400">{project.duration}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tools Used</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool, index) => (
                    <span key={index} className="bg-gray-800 px-3 py-1 rounded text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-700 px-3 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Behind the Scenes</h3>
              <p className="text-gray-300">{project.behindTheScenes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
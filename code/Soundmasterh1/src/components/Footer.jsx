import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Volume2 className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">SoundMasterH1</span>
            </div>
            <p className="text-gray-400">
              Professional audio production and sound engineering services.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/projects" className="hover:text-white">Projects</Link></li>
              <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Audio Production</li>
              <li>Sound Design</li>
              <li>Mixing & Mastering</li>
              <li>Voice-overs</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram className="w-5 h-5" /></a>
            </div>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>henry@soundmasterh1.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SoundMasterH1. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
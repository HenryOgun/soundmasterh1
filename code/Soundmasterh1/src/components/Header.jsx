import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-black/80 backdrop-blur-sm z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Volume2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold">SoundMasterH1</span>
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="hover:text-purple-400 transition-colors">Home</Link>
          <Link to="/projects" className="hover:text-purple-400 transition-colors">Projects</Link>
          <Link to="/categories" className="hover:text-purple-400 transition-colors">Categories</Link>
          <Link to="/about" className="hover:text-purple-400 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-purple-400 transition-colors">Contact</Link>
        </nav>
        <button className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
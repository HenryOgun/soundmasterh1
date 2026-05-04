import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  {
    label: 'Projects',
    path: '/projects',
    dropdown: [
      { label: 'Audio Production', path: '/projects/audio' },
      { label: 'Broadcast', path: '/projects/broadcast' },
      { label: 'Tech', path: '/projects/tech' },
    ],
  },
  { label: 'Articles', path: '/articles' },
  { label: 'Achievements', path: '/achievements' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[65px]">
          {/* Logo */}
          <button onClick={() => handleNav('/')} className="flex items-center gap-3 group">
            <img src="/without-the-name.png" alt="Henry Ogun" className="w-10 h-10 object-contain" />
            <div className="leading-tight text-left">
              <span className="block text-base font-bold text-gray-900 tracking-tight group-hover:text-[#f4b940] transition-colors">
                Henry Ogun
              </span>
              <span className="block text-[11px] font-semibold text-[#f4b940] tracking-widest uppercase">
                SoundMasterH1
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.path} className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === link.path ? null : link.path)}
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                      location.pathname.startsWith('/projects') ? 'text-[#f4b940]' : 'text-gray-800 hover:text-[#f4b940]'
                    }`}
                  >
                    {link.label}
                    <ChevronDown size={13} className={`transition-transform ${openDropdown === link.path ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === link.path && (
                    <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50">
                      {link.dropdown.map((sub) => (
                        <button key={sub.path} onClick={() => handleNav(sub.path)}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-[#f4b940] hover:bg-yellow-50 transition-colors">
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink key={link.path} to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium tracking-wide transition-colors ${isActive ? 'text-[#f4b940]' : 'text-gray-800 hover:text-[#f4b940]'}`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
            <button
              onClick={() => handleNav('/contact')}
              className="ml-4 px-5 py-2 bg-[#f4b940] text-black text-sm font-bold rounded hover:bg-yellow-400 transition-colors"
            >
              Get In Touch
            </button>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <div key={link.path}>
              <button
                onClick={() => link.dropdown ? setOpenDropdown(openDropdown === link.path ? null : link.path) : handleNav(link.path)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-800 hover:text-[#f4b940] transition-colors"
              >
                {link.label}
                {link.dropdown && <ChevronDown size={13} className={`transition-transform ${openDropdown === link.path ? 'rotate-180' : ''}`} />}
              </button>
              {link.dropdown && openDropdown === link.path && (
                <div className="pl-4 space-y-1">
                  {link.dropdown.map((sub) => (
                    <button key={sub.path} onClick={() => handleNav(sub.path)}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-[#f4b940] transition-colors">
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={() => handleNav('/contact')}
            className="w-full mt-2 px-5 py-2.5 bg-[#f4b940] text-black text-sm font-bold rounded transition-colors">
            Get In Touch
          </button>
        </div>
      )}
    </header>
  );
}

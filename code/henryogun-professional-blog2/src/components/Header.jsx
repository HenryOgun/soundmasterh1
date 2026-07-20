import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import GetInTouchModal from './GetInTouchModal';

const navLinks = [
  { label: 'Home', path: '/' },
  {
    label: 'Projects',
    path: '/projects',
    dropdown: [
      { label: 'Tech', path: '/projects/tech' },
      { label: 'Computer Repair & Maintenance', path: '/projects/repair' },
      { label: 'Audio Production', path: '/projects/audio' },
      { label: 'Broadcast', path: '/projects/broadcast' },
    ],
  },
  { label: 'Articles', path: '/articles' },
  { label: 'Services', path: '/services' },
  { label: 'Achievements', path: '/achievements' },
  { label: 'About', path: '/about' },
  { label: 'Recent Experience', path: '/recentexperience' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  const openContact = () => {
    setOpenDropdown(null);
    setMenuOpen(false);
    setShowContact(true);
  };

  return (
    <>
      {showContact && <GetInTouchModal onClose={() => setShowContact(false)} />}

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        {/* Gold accent top line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#f4b940] to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[62px]">
            {/* Logo */}
            <button onClick={() => handleNav('/')} className="flex items-center gap-3 group">
              <img src="/henryogun-trans-new.png" alt="Henry Ogun" className="w-9 h-9 object-contain" />
              <div className="leading-tight text-left">
                <span className="block text-sm font-bold text-gray-900 tracking-tight group-hover:text-[#f4b940] transition-colors">
                  Henry Ogun
                </span>
                <span className="block text-[10px] font-bold text-[#f4b940] tracking-[0.2em] uppercase">
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
                      className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors ${
                        location.pathname.startsWith('/projects') ? 'text-[#f4b940]' : 'text-gray-700 hover:text-[#f4b940]'
                      }`}
                    >
                      {link.label}
                      <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdown === link.path ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === link.path && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/8 py-1.5 z-50">
                        {link.dropdown.map((sub) => (
                          <button key={sub.path} onClick={() => handleNav(sub.path)}
                            className="block w-full text-left px-4 py-2.5 text-[13px] text-gray-600 hover:text-[#f4b940] hover:bg-yellow-50 transition-colors">
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink key={link.path} to={link.path}
                    onClick={() => setOpenDropdown(null)}
                    className={({ isActive }) =>
                      `px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors ${isActive ? 'text-[#f4b940]' : 'text-gray-700 hover:text-[#f4b940]'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              )}
              <button
                onClick={openContact}
                className="ml-4 px-5 py-2 bg-[#f4b940] text-black text-[13px] font-bold rounded-lg hover:bg-yellow-400 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-px"
              >
                Get In Touch
              </button>
            </nav>

            {/* Mobile toggle */}
            <button className="md:hidden p-2 text-gray-600 hover:text-[#f4b940] transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
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
                  className="flex items-center justify-between w-full px-3 py-2.5 text-[13px] font-medium text-gray-700 hover:text-[#f4b940] transition-colors"
                >
                  {link.label}
                  {link.dropdown && <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdown === link.path ? 'rotate-180' : ''}`} />}
                </button>
                {link.dropdown && openDropdown === link.path && (
                  <div className="pl-4 space-y-1">
                    {link.dropdown.map((sub) => (
                      <button key={sub.path} onClick={() => handleNav(sub.path)}
                        className="block w-full text-left px-3 py-2 text-[13px] text-gray-500 hover:text-[#f4b940] transition-colors">
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button onClick={openContact}
              className="w-full mt-3 px-5 py-2.5 bg-[#f4b940] text-black text-[13px] font-bold rounded-lg transition-colors">
              Get In Touch
            </button>
          </div>
        )}
      </header>
    </>
  );
}

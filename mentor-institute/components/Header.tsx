import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PartnerModal from './PartnerModal';

const NavLogo = () => (
    <svg className="h-8 w-auto text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);


const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTestDropdownOpen, setIsTestDropdownOpen] = useState(false);
  const [isMobileTestOpen, setIsMobileTestOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if (isOpen) setIsOpen(false);
    }
  };

  const navLinkClasses = 'block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700';
  const activeLinkClasses = 'bg-gray-900 text-white';
  
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses;
    
  const getSubNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    const subClasses = 'block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700';
    return isActive ? `${subClasses} bg-gray-800 text-white` : subClasses;
  }

  const getDesktopNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    const desktopClasses = 'px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700';
    return isActive ? `${desktopClasses} ${activeLinkClasses}` : desktopClasses;
  }
  
  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };
  
  return (
    <>
    <nav className="bg-brand-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center space-x-2">
                <NavLogo />
                <span className="text-white text-xl font-bold">Mentor Institute</span>
              </NavLink>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={getDesktopNavLinkClass}>Home</NavLink>
                <NavLink to="/about" className={getDesktopNavLinkClass}>About Us</NavLink>
                <NavLink to="/courses" className={getDesktopNavLinkClass}>Courses</NavLink>
                <NavLink to="/gallery" className={getDesktopNavLinkClass}>Workshop</NavLink>
                <div className="relative" onMouseEnter={() => setIsTestDropdownOpen(true)} onMouseLeave={() => setIsTestDropdownOpen(false)}>
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 flex items-center">
                    Test
                    <ChevronDownIcon isOpen={isTestDropdownOpen} />
                  </button>
                  {isTestDropdownOpen && (
                    <div className="absolute left-0 mt-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <NavLink to="/practice" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100 hover:text-gray-900`}>Practice</NavLink>
                        <NavLink to="/contest" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100 hover:text-gray-900`}>Contest</NavLink>
                      </div>
                    </div>
                  )}
                </div>
                <NavLink to="/contact" className={getDesktopNavLinkClass}>Contact</NavLink>
              </div>
            </div>
          </div>
           <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, events..."
                    aria-label="Search courses and events"
                    className="bg-gray-700 text-white placeholder-gray-400 text-sm rounded-md block w-full pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white">
                    <SearchIcon />
                </button>
            </form>
             <button
                onClick={() => setIsPartnerModalOpen(true)}
                className="px-3 py-2 rounded-md text-sm font-medium text-white border border-brand-purple hover:bg-brand-purple transition-colors"
              >
                Join us
              </button>
            {user ? (
              <div className="flex items-center space-x-2">
                 <NavLink to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-brand-purple hover:bg-opacity-90">
                    Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-brand-purple hover:bg-opacity-90"
              >
                Login
              </NavLink>
            )}
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={getNavLinkClass} onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/about" className={getNavLinkClass} onClick={() => setIsOpen(false)}>About Us</NavLink>
            <NavLink to="/courses" className={getNavLinkClass} onClick={() => setIsOpen(false)}>Courses</NavLink>
            <NavLink to="/gallery" className={getNavLinkClass} onClick={() => setIsOpen(false)}>Workshop</NavLink>
             <div>
              <button
                onClick={() => setIsMobileTestOpen(!isMobileTestOpen)}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Test
                <ChevronDownIcon isOpen={isMobileTestOpen} />
              </button>
              {isMobileTestOpen && (
                <div className="pl-4 mt-1 space-y-1">
                  <NavLink to="/practice" className={getSubNavLinkClass} onClick={() => setIsOpen(false)}>Practice</NavLink>
                  <NavLink to="/contest" className={getSubNavLinkClass} onClick={() => setIsOpen(false)}>Contest</NavLink>
                </div>
              )}
            </div>
            <NavLink to="/contact" className={getNavLinkClass} onClick={() => setIsOpen(false)}>Contact</NavLink>
            <div className="border-t border-gray-700 mt-3 pt-3 space-y-3">
              <form onSubmit={handleSearchSubmit} className="relative px-1">
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      aria-label="Search courses and events"
                      className="bg-gray-700 text-white placeholder-gray-400 text-sm rounded-md block w-full pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                  <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 flex items-center pr-3 mr-1 text-gray-400 hover:text-white">
                      <SearchIcon />
                  </button>
              </form>
              <button onClick={() => { setIsPartnerModalOpen(true); setIsOpen(false); }} className="text-left w-full block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                Join us
              </button>
              {user ? (
                 <div className="flex flex-col space-y-1">
                    <NavLink to="/dashboard" className={getNavLinkClass} onClick={() => setIsOpen(false)}>Dashboard</NavLink>
                    <button onClick={handleLogout} className="text-left w-full block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                        Logout
                    </button>
                 </div>
              ) : (
                <NavLink to="/login" className={getNavLinkClass} onClick={() => setIsOpen(false)}>Login</NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
    {isPartnerModalOpen && <PartnerModal onClose={() => setIsPartnerModalOpen(false)} />}
    </>
  );
};

export default Header;
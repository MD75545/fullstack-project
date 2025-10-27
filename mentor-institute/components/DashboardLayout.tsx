import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';
import { useSearch } from '../context/SearchContext';

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

interface DashboardLayoutProps {
  navItems: { name: string; icon: React.ReactNode; onClick: () => void; active: boolean }[];
  children: React.ReactNode;
  pageTitle: string;
}

const SearchInput: React.FC<{ className?: string }> = ({ className }) => {
    const { searchQuery, setSearchQuery } = useSearch();
    return (
        <div className={`relative ${className}`}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
            </span>
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple"
                aria-label="Search"
            />
        </div>
    );
}

const DashboardLayoutInternal: React.FC<DashboardLayoutProps> = ({ navItems, children, pageTitle }) => {
  const { user } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  if (!user) return null;

  return (
    <div className="relative flex h-[calc(100vh-64px)] bg-slate-50">
      {isMobileNavOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
        />
      )}
      <Sidebar 
        navItems={navItems} 
        userName={user.name} 
        userRole={user.role} 
        isMobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm z-10">
            <div className="md:hidden flex items-center justify-between p-4 border-b">
                <button onClick={() => setIsMobileNavOpen(true)} className="text-gray-600" aria-label="Open menu">
                    <MenuIcon />
                </button>
                <h1 className="text-lg font-bold text-gray-800 truncate">{pageTitle}</h1>
                <div>
                  {user.role === 'superadmin' && <Notifications />}
                </div>
            </div>
             <div className="p-4 md:hidden border-b">
                <SearchInput />
            </div>
            <div className="hidden md:flex items-center justify-between p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{pageTitle}</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome back, {user.name}. Here's an overview of your dashboard.</p>
                </div>
                 <div className="flex items-center gap-4">
                    <SearchInput className="w-64" />
                    {user.role === 'superadmin' && <Notifications />}
                </div>
            </div>
        </header>
        <div className="p-4 sm:p-6 flex-grow">
          {children}
        </div>
      </main>
    </div>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => (
    <DashboardLayoutInternal {...props} />
);

export default DashboardLayout;
import React from 'react';

interface SidebarProps {
  navItems: { name: string; onClick: () => void; active: boolean; icon: React.ReactNode }[];
  userName: string;
  userRole: string;
  isMobileOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, userName, userRole, isMobileOpen, onClose }) => {
  return (
    <div 
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white flex-col flex-shrink-0 flex transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold truncate">{userName}</h2>
        <p className="text-sm text-gray-400 capitalize">{userRole}</p>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                  item.active
                    ? 'bg-brand-purple/10 text-brand-purple'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
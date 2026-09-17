import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Generator', path: '/generate', icon: 'auto_awesome' },
    { name: 'Saved Recipes', path: '/saved', icon: 'bookmark' },
    { name: 'Nutrition', path: '/nutrition', icon: 'analytics' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  if (user?.is_admin || user?.is_staff) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: 'admin_panel_settings' });
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full p-4 z-40 bg-surface-container-low/90 backdrop-blur-xl border-r border-border-subtle/10 shadow-xl shadow-primary/10 w-64 pt-20">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
          </div>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-primary">AI Chef</h2>
            <p className="font-label-sm text-on-surface-variant text-[10px] tracking-widest uppercase">Culinary Intelligence</p>
          </div>
        </div>
      </div>
      
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 font-label-md text-label-md transition-all active:scale-[0.98] ${
                isActive
                  ? 'bg-primary/10 text-primary border-r-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-variant/50 hover:translate-x-1 hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-outline-variant/10">
        <button 
          onClick={() => navigate('/generate')}
          className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.03] transition-transform shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>New Recipe</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

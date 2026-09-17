import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-lg border-b border-border-subtle/10 shadow-sm shadow-primary/5">
      <div className="flex items-center gap-6 md:gap-8">
        <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
          AI Recipe Generator
        </Link>
        <div className="hidden md:flex items-center gap-2 bg-surface-container-high rounded-full px-4 py-1.5 border border-outline-variant/20">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-label-md text-on-surface placeholder:text-on-surface-variant/50 w-48 md:w-64 outline-none" placeholder="Search recipes..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-8">
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md">Explore</Link>
          <Link to="/saved" className="text-on-surface-variant font-medium hover:scale-105 transition-transform duration-200 hover:text-primary font-label-md text-label-md">Saved</Link>
          <Link to="/nutrition" className="text-on-surface-variant font-medium hover:scale-105 transition-transform duration-200 hover:text-primary font-label-md text-label-md">Nutrition</Link>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
          <button className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>sparkles</button>
          
          <Link to="/settings" className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container-highest">
            {user?.avatar ? (
              <img alt="User Avatar" className="w-full h-full object-cover" src={user.avatar}/>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary-container font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRecipes } from '../../services/recipe';

// Build notifications from recent recipe activity
const buildNotifications = (recipes) => {
  if (!recipes || recipes.length === 0) return [];
  return recipes.slice(0, 8).map(r => {
    const createdAt = r.createdAt || r.created_at;
    const timeAgo = createdAt ? getTimeAgo(new Date(createdAt)) : '';
    const isAdaptation = !!r.originalRecipeId || !!r.adaptationType;

    return {
      id: r.id || r._id,
      title: r.title,
      message: isAdaptation
        ? `Adapted: "${r.adaptationType || 'Custom'}"`
        : `Generated — ${r.nutrition?.calories || 0} kcal, ${r.metadata?.cuisine || r.cuisine || 'Mixed'}`,
      icon: isAdaptation ? 'tune' : 'auto_awesome',
      color: isAdaptation ? 'text-secondary' : 'text-primary',
      timeAgo,
      read: false,
    };
  });
};

const getTimeAgo = (date) => {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const recipes = await getRecipes();
        setNotifications(buildNotifications(recipes));
      } catch { /* silently fail */ }
    };
    if (user) load();
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleClick = (notif) => {
    setReadIds(prev => new Set(prev).add(notif.id));
    setOpen(false);
    navigate(`/recipe/${notif.id}`);
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

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

          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleOpen}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors relative"
            >
              notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 top-12 w-80 glass-card rounded-2xl shadow-2xl shadow-primary/10 border border-outline-variant/10 overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
                  <h3 className="font-label-md text-on-surface">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-primary text-label-sm hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant opacity-30 mb-2 block">notifications_off</span>
                      <p className="text-on-surface-variant text-label-sm">No notifications yet</p>
                      <p className="text-outline text-xs mt-1">Generate a recipe to see activity here</p>
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const isRead = readIds.has(notif.id);
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleClick(notif)}
                          className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-surface-container/50 transition-colors border-b border-outline-variant/5 last:border-0 ${!isRead ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!isRead ? 'bg-primary/15' : 'bg-surface-container'}`}>
                            <span className={`material-symbols-outlined text-base ${notif.color}`}>{notif.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-label-sm truncate ${!isRead ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-outline truncate">{notif.message}</p>
                          </div>
                          <span className="text-[10px] text-outline shrink-0 mt-0.5">{notif.timeAgo}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-outline-variant/10 text-center">
                    <Link to="/saved" onClick={() => setOpen(false)} className="text-primary text-label-sm hover:underline">
                      View all recipes →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

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

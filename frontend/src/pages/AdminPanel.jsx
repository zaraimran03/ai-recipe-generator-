import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listUsers, deleteUser, listAllRecipes, deleteAnyRecipe, getStats } from '../services/admin';
import { Navigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useToast, Toast } from '../components/ui/Toast';

const TABS = ['Users', 'Recipes'];

export const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState('Users');
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [u, r, s] = await Promise.all([listUsers(), listAllRecipes(), getStats()]);
      setUsers(u);
      setRecipes(r);
      setStats(s);
    } catch (e) { addToast('Failed to load admin data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteUser = async (id) => {
    if (id === currentUser?.id) { addToast("Can't delete your own account", 'error'); return; }
    await deleteUser(id);
    addToast('User deleted', 'info');
    load();
  };

  const handleDeleteRecipe = async (id) => {
    await deleteAnyRecipe(id);
    addToast('Recipe deleted', 'info');
    load();
  };

  if (currentUser && !currentUser.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Admin Panel</h1>
            <p className="text-on-surface-variant">Manage users and content</p>
          </div>
          <div className="flex gap-4">
            <GlassCard className="!p-4 text-center">
              <div className="font-headline-md text-primary">{stats?.total_users || users.length}</div>
              <div className="font-label-sm text-on-surface-variant">Users</div>
            </GlassCard>
            <GlassCard className="!p-4 text-center">
              <div className="font-headline-md text-secondary">{stats?.total_recipes_generated || recipes.length}</div>
              <div className="font-label-sm text-on-surface-variant">Recipes</div>
            </GlassCard>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-lg font-label-md transition-all ${tab === t ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {t}
            </button>
          ))}
        </div>

        <GlassCard className="!p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({length: 4}).map((_, i) => <SkeletonLoader key={i} type="row"/>)}
            </div>
          ) : tab === 'Users' ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left px-6 py-4 font-label-md text-on-surface-variant">User</th>
                  <th className="text-left px-6 py-4 font-label-md text-on-surface-variant hidden md:table-cell">Email</th>
                  <th className="text-left px-6 py-4 font-label-md text-on-surface-variant hidden lg:table-cell">Role</th>
                  <th className="text-left px-6 py-4 font-label-md text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-outline-variant/5 hover:bg-surface-container/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface-container/20'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm overflow-hidden">
                          {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt=""/> : u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-label-md text-on-surface">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-label-sm text-on-surface-variant hidden md:table-cell">{u.email}</td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`px-3 py-1 rounded-full text-label-sm ${u.is_staff ? 'bg-primary/15 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {u.is_staff ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === currentUser?.id}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left px-6 py-4 font-label-md text-on-surface-variant">Recipe</th>
                  <th className="text-left px-6 py-4 font-label-md text-on-surface-variant hidden md:table-cell">Difficulty</th>
                  <th className="text-left px-6 py-4 font-label-md text-on-surface-variant hidden lg:table-cell">Calories</th>
                  <th className="text-left px-6 py-4 font-label-md text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((r, i) => (
                  <tr key={r.id} className={`border-b border-outline-variant/5 hover:bg-surface-container/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface-container/20'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-primary/50"><span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span></div>
                        <span className="font-label-md text-on-surface line-clamp-1">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-3 py-1 bg-surface-variant rounded-full text-label-sm text-on-surface-variant">{r.difficulty}</span>
                    </td>
                    <td className="px-6 py-4 font-label-sm text-on-surface-variant hidden lg:table-cell">{r.nutrition?.calories || 0} kcal</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteRecipe(r.id)}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      </div>
    </>
  );
};

export default AdminPanel;

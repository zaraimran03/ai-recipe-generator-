import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getStats,
  listUsers,
  updateUser,
  deleteUser,
  listAllRecipes,
  getRecipeStats,
  updateRecipeStatus,
  deleteAnyRecipe,
  getAiUsage,
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettings,
} from '../services/admin';
import { Navigate, Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useToast, Toast } from '../components/ui/Toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'users', label: 'Users', icon: 'manage_accounts' },
  { id: 'recipes', label: 'Recipes & Moderation', icon: 'restaurant' },
  { id: 'ai', label: 'AI Monitoring', icon: 'monitoring' },
  { id: 'settings', label: 'System Settings', icon: 'tune' },
];

export const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  // Overview Data
  const [stats, setStats] = useState(null);

  // Users Data & Filters
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [savingUser, setSavingUser] = useState(false);

  // Recipes Data & Filters
  const [recipes, setRecipes] = useState([]);
  const [recipeStats, setRecipeStats] = useState(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeStatusFilter, setRecipeStatusFilter] = useState('all');
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [flagModalRecipe, setFlagModalRecipe] = useState(null);
  const [flagReason, setFlagReason] = useState('');

  // AI Usage Data
  const [aiUsage, setAiUsage] = useState(null);

  // System Settings Data
  const [settings, setSettings] = useState({
    supportedCuisines: [],
    supportedDietaryPreferences: [],
    recipeGenerationLimits: {
      guestLimit: 2,
      maxDailyPerUser: 50,
      maxCookingTimeMinutes: 180,
      defaultServings: 2,
    },
    aiSettings: {
      model: 'openai/gpt-oss-120b',
      maxTokens: 2500,
      temperature: 0.2,
    },
  });
  const [newCuisine, setNewCuisine] = useState('');
  const [newDiet, setNewDiet] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // ── Loaders ───────────────────────────────────────────────────
  const loadOverview = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) {
      addToast('Failed to load dashboard overview stats', 'error');
    }
  }, [addToast]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await listUsers({
        search: userSearch,
        role: userRoleFilter,
        status: userStatusFilter,
      });
      setUsers(data);
    } catch (e) {
      addToast('Failed to fetch users', 'error');
    }
  }, [userSearch, userRoleFilter, userStatusFilter, addToast]);

  const loadRecipes = useCallback(async () => {
    try {
      const [data, rStats] = await Promise.all([
        listAllRecipes({ search: recipeSearch, status: recipeStatusFilter }),
        getRecipeStats(),
      ]);
      setRecipes(data);
      setRecipeStats(rStats);
    } catch (e) {
      addToast('Failed to fetch recipes and moderation stats', 'error');
    }
  }, [recipeSearch, recipeStatusFilter, addToast]);

  const loadAiUsage = useCallback(async () => {
    try {
      const data = await getAiUsage();
      setAiUsage(data);
    } catch (e) {
      addToast('Failed to fetch AI telemetry logs', 'error');
    }
  }, [addToast]);

  const loadSettings = useCallback(async () => {
    try {
      const data = await getSystemSettings();
      if (data) {
        setSettings({
          supportedCuisines: data.supportedCuisines || [],
          supportedDietaryPreferences: data.supportedDietaryPreferences || [],
          recipeGenerationLimits: data.recipeGenerationLimits || {
            guestLimit: 2,
            maxDailyPerUser: 50,
            maxCookingTimeMinutes: 180,
            defaultServings: 2,
          },
          aiSettings: data.aiSettings || {
            model: 'openai/gpt-oss-120b',
            maxTokens: 2500,
            temperature: 0.2,
          },
        });
      }
    } catch (e) {
      addToast('Failed to load system settings', 'error');
    }
  }, [addToast]);

  // Master refresh depending on active tab
  const refreshActiveTab = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') await loadOverview();
      else if (activeTab === 'users') await loadUsers();
      else if (activeTab === 'recipes') await loadRecipes();
      else if (activeTab === 'ai') await loadAiUsage();
      else if (activeTab === 'settings') await loadSettings();
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadOverview, loadUsers, loadRecipes, loadAiUsage, loadSettings]);

  useEffect(() => {
    refreshActiveTab();
  }, [refreshActiveTab]);

  // ── User Management Handlers ──────────────────────────────────
  const handleToggleVerification = async (u) => {
    try {
      await updateUser(u.id, { isVerified: !u.isVerified });
      addToast(`User ${u.name || u.email} ${!u.isVerified ? 'verified' : 'unverified'}`, 'success');
      loadUsers();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to update verification', 'error');
    }
  };

  const handleToggleRole = async (u) => {
    if (u.id === currentUser?.id) {
      addToast('You cannot alter your own admin privileges.', 'error');
      return;
    }
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUser(u.id, { role: newRole });
      addToast(`User role changed to ${newRole}`, 'success');
      loadUsers();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    try {
      await updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        isVerified: editingUser.isVerified,
        role: editingUser.role,
      });
      addToast('User details updated successfully', 'success');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      addToast('User account and related data removed', 'info');
      setUserToDelete(null);
      loadUsers();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  // ── Recipe Moderation Handlers ────────────────────────────────
  const handleToggleRecipeStatus = async (r, newStatus) => {
    try {
      await updateRecipeStatus(r.id, { status: newStatus });
      addToast(`Recipe marked as ${newStatus}`, 'success');
      loadRecipes();
    } catch (e) {
      addToast('Failed to update recipe status', 'error');
    }
  };

  const handleSaveFlagReport = async () => {
    if (!flagModalRecipe) return;
    try {
      await updateRecipeStatus(flagModalRecipe.id, {
        status: 'flagged',
        isReported: true,
        reportReason: flagReason || 'Flagged by administrator for review',
      });
      addToast('Recipe marked as flagged for review', 'info');
      setFlagModalRecipe(null);
      setFlagReason('');
      loadRecipes();
    } catch (e) {
      addToast('Failed to flag recipe', 'error');
    }
  };

  const handleUnflagRecipe = async (r) => {
    try {
      await updateRecipeStatus(r.id, {
        status: 'active',
        isReported: false,
        reportReason: '',
      });
      addToast('Recipe unflagged and restored to active status', 'success');
      loadRecipes();
    } catch (e) {
      addToast('Failed to restore recipe', 'error');
    }
  };

  const handleConfirmDeleteRecipe = async () => {
    if (!recipeToDelete) return;
    try {
      await deleteAnyRecipe(recipeToDelete.id);
      addToast('Recipe removed successfully', 'info');
      setRecipeToDelete(null);
      loadRecipes();
    } catch (e) {
      addToast('Failed to delete recipe', 'error');
    }
  };

  // ── System Settings Handlers ──────────────────────────────────
  const handleAddCuisine = () => {
    const trimmed = newCuisine.trim();
    if (trimmed && !settings.supportedCuisines.includes(trimmed)) {
      setSettings(prev => ({
        ...prev,
        supportedCuisines: [...prev.supportedCuisines, trimmed],
      }));
      setNewCuisine('');
    }
  };

  const handleRemoveCuisine = (c) => {
    setSettings(prev => ({
      ...prev,
      supportedCuisines: prev.supportedCuisines.filter(x => x !== c),
    }));
  };

  const handleAddDiet = () => {
    const trimmed = newDiet.trim().toLowerCase().replace(/\s+/g, '_');
    if (trimmed && !settings.supportedDietaryPreferences.includes(trimmed)) {
      setSettings(prev => ({
        ...prev,
        supportedDietaryPreferences: [...prev.supportedDietaryPreferences, trimmed],
      }));
      setNewDiet('');
    }
  };

  const handleRemoveDiet = (d) => {
    setSettings(prev => ({
      ...prev,
      supportedDietaryPreferences: prev.supportedDietaryPreferences.filter(x => x !== d),
    }));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateSystemSettings(settings);
      addToast('System settings saved and active across the platform!', 'success');
    } catch (e) {
      addToast('Failed to save system settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetSettings = async () => {
    if (!window.confirm('Reset all system settings, supported cuisines, and limits to factory defaults?')) return;
    setSavingSettings(true);
    try {
      const res = await resetSystemSettings();
      if (res?.settings) setSettings(res.settings);
      addToast('System settings reset to defaults', 'info');
    } catch (e) {
      addToast('Failed to reset settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Role Gate check
  if (currentUser && currentUser.role !== 'admin' && !currentUser.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
              <h1 className="font-headline-xl text-headline-xl text-on-surface">Admin Command Center</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold uppercase tracking-wider">
                Full Access
              </span>
            </div>
            <p className="text-on-surface-variant font-body-md">
              Real-time system telemetry, user accounts, recipe moderation, AI logs, and platform settings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/60 border border-outline-variant/20 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Groq AI & MongoDB Active</span>
            </div>
            <button
              onClick={refreshActiveTab}
              className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface hover:text-primary transition-all duration-200 cursor-pointer shadow-sm"
              title="Refresh Current Tab Data"
            >
              <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex gap-1.5 p-1.5 bg-surface-container rounded-2xl w-fit border border-outline-variant/20 overflow-x-auto max-w-full shadow-sm">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md text-label-md whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md shadow-primary/20 font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: OVERVIEW DASHBOARD ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <GlassCard className="!p-5 text-center space-y-1">
                <span className="material-symbols-outlined text-primary text-2xl">group</span>
                <div className="font-headline-lg text-primary font-bold">{stats?.total_users ?? '—'}</div>
                <div className="font-label-sm text-on-surface-variant text-xs">Total Users</div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  {stats ? `${stats.verified_users} verified` : ''}
                </div>
              </GlassCard>

              <GlassCard className="!p-5 text-center space-y-1">
                <span className="material-symbols-outlined text-secondary text-2xl">auto_awesome</span>
                <div className="font-headline-lg text-secondary font-bold">{stats?.total_recipes ?? '—'}</div>
                <div className="font-label-sm text-on-surface-variant text-xs">AI Recipes Created</div>
                <div className="text-[11px] text-on-surface-variant/80">Public database</div>
              </GlassCard>

              <GlassCard className="!p-5 text-center space-y-1">
                <span className="material-symbols-outlined text-tertiary text-2xl">bookmark</span>
                <div className="font-headline-lg text-tertiary font-bold">{stats?.total_favorites ?? '—'}</div>
                <div className="font-label-sm text-on-surface-variant text-xs">Recipe Saves</div>
                <div className="text-[11px] text-on-surface-variant/80">User favorites</div>
              </GlassCard>

              <GlassCard className="!p-5 text-center space-y-1 border-primary/20">
                <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
                <div className="font-headline-lg text-primary font-bold">{stats?.total_family_recipes ?? '—'}</div>
                <div className="font-label-sm text-on-surface-variant text-xs">Family Vaults</div>
                <div className="text-[11px] text-emerald-400 flex items-center justify-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">lock</span> Private
                </div>
              </GlassCard>

              <GlassCard className="!p-5 text-center space-y-1">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">check_circle</span>
                <div className="font-headline-lg text-emerald-400 font-bold">
                  {stats?.ai_stats?.success_rate != null ? `${stats.ai_stats.success_rate}%` : '100%'}
                </div>
                <div className="font-label-sm text-on-surface-variant text-xs">AI Success Rate</div>
                <div className="text-[11px] text-on-surface-variant/80">Groq LLM engine</div>
              </GlassCard>

              <GlassCard className="!p-5 text-center space-y-1">
                <span className="material-symbols-outlined text-amber-400 text-2xl">speed</span>
                <div className="font-headline-lg text-amber-400 font-bold">
                  {stats?.ai_stats?.avg_latency_ms ? `${stats.ai_stats.avg_latency_ms}ms` : '1.2s'}
                </div>
                <div className="font-label-sm text-on-surface-variant text-xs">Avg AI Latency</div>
                <div className="text-[11px] text-on-surface-variant/80">
                  {stats?.ai_stats?.total_requests || 0} total calls
                </div>
              </GlassCard>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('users')}
                className="glass-card p-5 rounded-2xl text-left hover:border-primary/40 transition-all hover:scale-[1.02] cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">manage_accounts</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
                <h3 className="font-label-lg font-bold text-on-surface">Manage User Accounts</h3>
                <p className="text-xs text-on-surface-variant">Verify accounts, promote admins, or audit permissions.</p>
              </button>

              <button
                onClick={() => setActiveTab('recipes')}
                className="glass-card p-5 rounded-2xl text-left hover:border-secondary/40 transition-all hover:scale-[1.02] cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">shield</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
                <h3 className="font-label-lg font-bold text-on-surface">Recipe Content Moderation</h3>
                <p className="text-xs text-on-surface-variant">Review flagged recipes and audit generated meals.</p>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className="glass-card p-5 rounded-2xl text-left hover:border-tertiary/40 transition-all hover:scale-[1.02] cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-tertiary transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
                <h3 className="font-label-lg font-bold text-on-surface">AI Performance & Logs</h3>
                <p className="text-xs text-on-surface-variant">Track Groq response times, error rates, and token counts.</p>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="glass-card p-5 rounded-2xl text-left hover:border-primary/40 transition-all hover:scale-[1.02] cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">tune</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
                <h3 className="font-label-lg font-bold text-on-surface">System Configuration</h3>
                <p className="text-xs text-on-surface-variant">Edit allowed cuisines, dietary preferences & generation limits.</p>
              </button>
            </div>

            {/* Recent Database Activity Stream */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  <h3 className="font-headline-md text-on-surface">Live Database Activity Stream</h3>
                </div>
                <span className="text-xs text-on-surface-variant">Real-time DB Events</span>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonLoader key={i} type="row" />
                  ))}
                </div>
              ) : !stats?.recent_activity || stats.recent_activity.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl opacity-30 mb-2 block">history_toggle_off</span>
                  <p>No recent activity recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {stats.recent_activity.map((act) => (
                    <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                          <span className={`material-symbols-outlined text-[18px] ${act.color}`}>
                            {act.icon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-label-md text-on-surface font-medium truncate">{act.title}</p>
                          <p className="text-xs text-on-surface-variant truncate">{act.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-xs text-outline shrink-0">
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ── TAB 2: USER MANAGEMENT ── */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter & Search Toolbar */}
            <GlassCard className="!p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline text-body-md"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface text-label-md focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins Only</option>
                  <option value="user">Regular Users</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface text-label-md focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>

                <Button variant="outlined" onClick={loadUsers} className="!py-2 !px-4 text-xs">
                  Apply Filter
                </Button>
              </div>
            </GlassCard>

            {/* Users Table */}
            <GlassCard className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-high/40">
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">User</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Role</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Verification</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant hidden md:table-cell">Recipes Made</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant hidden lg:table-cell">Joined Date</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-6">
                          <SkeletonLoader lines={4} />
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-16 text-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">group_off</span>
                          <p className="font-label-md">No matching user accounts found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const isSelf = u.id === currentUser?.id;
                        const isAdmin = u.role === 'admin' || u.is_superuser;
                        return (
                          <tr key={u.id} className="hover:bg-surface-container-high/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-on-primary flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                  {u.avatar ? (
                                    <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    (u.name || u.email).charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-label-md text-on-surface font-semibold truncate flex items-center gap-1.5">
                                    <span>{u.name || u.email.split('@')[0]}</span>
                                    {isSelf && (
                                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-normal">
                                        You
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  isAdmin
                                    ? 'bg-primary/15 text-primary border border-primary/30'
                                    : 'bg-surface-container-highest text-on-surface-variant'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {isAdmin ? 'shield' : 'person'}
                                </span>
                                {isAdmin ? 'Admin' : 'User'}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                  u.isVerified
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {u.isVerified ? 'verified' : 'pending'}
                                </span>
                                {u.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            </td>

                            <td className="px-6 py-4 hidden md:table-cell text-sm text-on-surface-variant">
                              <span className="font-semibold text-on-surface">{u.recipeCount || 0}</span> recipes
                            </td>

                            <td className="px-6 py-4 hidden lg:table-cell text-xs text-on-surface-variant">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleVerification(u)}
                                  className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                    u.isVerified
                                      ? 'text-amber-400 hover:bg-amber-400/10'
                                      : 'text-emerald-400 hover:bg-emerald-400/10'
                                  }`}
                                  title={u.isVerified ? 'Revoke verification' : 'Mark as verified'}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {u.isVerified ? 'close' : 'check'}
                                  </span>
                                </button>

                                <button
                                  onClick={() => handleToggleRole(u)}
                                  disabled={isSelf}
                                  className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 cursor-pointer"
                                  title={isAdmin ? 'Demote to regular user' : 'Promote to Admin'}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isAdmin ? 'arrow_downward' : 'arrow_upward'}
                                  </span>
                                </button>

                                <button
                                  onClick={() => setEditingUser(u)}
                                  className="p-2 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                                  title="Edit user profile"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>

                                <button
                                  onClick={() => setUserToDelete(u)}
                                  disabled={isSelf}
                                  className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors disabled:opacity-30 cursor-pointer"
                                  title="Delete user account"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── TAB 3: RECIPES & CONTENT MODERATION ── */}
        {activeTab === 'recipes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Privacy Shield Notice Banner */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3.5">
              <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">lock</span>
              <div className="text-sm space-y-1">
                <p className="font-semibold text-primary">Family Recipes Privacy Protection Active</p>
                <p className="text-on-surface-variant">
                  Personal family heirloom recipes stored in users' private vaults are completely confidential. Only community-generated recipes are subject to administrative moderation and inspection below.
                  {recipeStats?.family_recipes_stats && (
                    <span className="block mt-1 font-medium text-on-surface">
                      Total Private Family Vaults Active: {recipeStats.family_recipes_stats.total_vaults} entries ({recipeStats.family_recipes_stats.total_modernizations} AI modernizations).
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <GlassCard className="!p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search recipe title..."
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadRecipes()}
                  className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline text-body-md"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Recipes' },
                  { id: 'flagged', label: 'Flagged / Reported' },
                  { id: 'active', label: 'Active' },
                  { id: 'hidden', label: 'Hidden' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRecipeStatusFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      recipeStatusFilter === f.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Recipes Table */}
            <GlassCard className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-high/40">
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Recipe Title</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant hidden md:table-cell">Creator</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant hidden lg:table-cell">Cuisine / Diff</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Status</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="p-6">
                          <SkeletonLoader lines={4} />
                        </td>
                      </tr>
                    ) : recipes.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-16 text-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">menu_book</span>
                          <p className="font-label-md">No recipes found matching current filters</p>
                        </td>
                      </tr>
                    ) : (
                      recipes.map((r) => {
                        const isFlagged = r.status === 'flagged' || r.isReported;
                        const isHidden = r.status === 'hidden';
                        return (
                          <tr key={r.id} className="hover:bg-surface-container-high/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-primary/70 shrink-0">
                                  <span className="material-symbols-outlined text-[20px]">restaurant</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-label-md text-on-surface font-semibold line-clamp-1">{r.title}</p>
                                  <p className="text-xs text-on-surface-variant truncate">
                                    {r.nutrition?.calories || 0} kcal • {r.metadata?.totalTimeMinutes || r.time || 30} mins
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 hidden md:table-cell">
                              <div className="text-sm">
                                <p className="text-on-surface font-medium truncate">{r.user?.name || 'Home Cook'}</p>
                                <p className="text-xs text-on-surface-variant truncate">{r.user?.email || 'Guest'}</p>
                              </div>
                            </td>

                            <td className="px-6 py-4 hidden lg:table-cell">
                              <div className="text-xs space-y-1">
                                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                                  {r.metadata?.cuisine || r.cuisine || 'Fusion'}
                                </span>
                                <span className="ml-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                                  {r.metadata?.difficulty || r.difficulty || 'Easy'}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              {isFlagged ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-error/15 text-error border border-error/30">
                                  <span className="material-symbols-outlined text-[14px]">flag</span> Flagged
                                </span>
                              ) : isHidden ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <span className="material-symbols-outlined text-[14px]">visibility_off</span> Hidden
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Active
                                </span>
                              )}
                              {r.reportReason && (
                                <p className="text-[11px] text-error/80 mt-1 truncate max-w-xs">{r.reportReason}</p>
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/recipe/${r.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                                  title="Inspect recipe details"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </Link>

                                {isFlagged ? (
                                  <button
                                    onClick={() => handleUnflagRecipe(r)}
                                    className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                                    title="Unflag and approve recipe"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">outlined_flag</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setFlagModalRecipe(r)}
                                    className="p-2 rounded-lg text-on-surface-variant hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                                    title="Flag as inappropriate"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">flag</span>
                                  </button>
                                )}

                                {isHidden ? (
                                  <button
                                    onClick={() => handleToggleRecipeStatus(r, 'active')}
                                    className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                                    title="Restore visibility"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleRecipeStatus(r, 'hidden')}
                                    className="p-2 rounded-lg text-on-surface-variant hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                                    title="Hide from public explore"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => setRecipeToDelete(r)}
                                  className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                                  title="Delete recipe permanently"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── TAB 4: AI USAGE MONITORING ── */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* AI Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Requests</span>
                  <span className="material-symbols-outlined text-primary">data_object</span>
                </div>
                <div className="text-3xl font-bold text-on-surface">{aiUsage?.summary?.total_requests || 0}</div>
                <p className="text-xs text-on-surface-variant">All Groq LLM invocations</p>
              </GlassCard>

              <GlassCard className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Success Rate</span>
                  <span className="material-symbols-outlined text-emerald-400">verified</span>
                </div>
                <div className="text-3xl font-bold text-emerald-400">
                  {aiUsage?.summary?.success_rate != null ? `${aiUsage.summary.success_rate}%` : '100%'}
                </div>
                <p className="text-xs text-on-surface-variant">{aiUsage?.summary?.error_requests || 0} failed requests</p>
              </GlassCard>

              <GlassCard className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Active Model</span>
                  <span className="material-symbols-outlined text-secondary">memory</span>
                </div>
                <div className="text-xl font-bold text-secondary truncate">
                  {aiUsage?.summary?.active_model || 'openai/gpt-oss-120b'}
                </div>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">security</span> API Key Secured
                </p>
              </GlassCard>

              <GlassCard className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Security Shield</span>
                  <span className="material-symbols-outlined text-primary">key_off</span>
                </div>
                <div className="text-xl font-bold text-on-surface">Protected Keys</div>
                <p className="text-xs text-on-surface-variant">Zero credentials exposed to browser</p>
              </GlassCard>
            </div>

            {/* Operations Breakdown */}
            <GlassCard>
              <h3 className="font-headline-md text-on-surface mb-4">AI Operations Telemetry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(aiUsage?.operations || []).map((op) => (
                  <div key={op.operation} className="p-4 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {op.operation.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">{op.count} calls</span>
                    </div>
                    <div className="text-lg font-bold text-on-surface">{op.avgDurationMs}ms avg</div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${op.successRate}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant text-right">{op.successRate}% success</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recent Request Logs */}
            <GlassCard className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
                <h3 className="font-headline-md text-on-surface">Recent Groq API Request Logs</h3>
                <span className="text-xs text-on-surface-variant">Live System Invocations</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-high/40">
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Timestamp</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Operation</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Model</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Status</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Duration</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant">Diagnostics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-6">
                          <SkeletonLoader lines={4} />
                        </td>
                      </tr>
                    ) : !aiUsage?.recent_logs || aiUsage.recent_logs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-16 text-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">terminal</span>
                          <p className="font-label-md">No telemetry logs recorded yet. Generate a recipe to initialize.</p>
                        </td>
                      </tr>
                    ) : (
                      aiUsage.recent_logs.map((log) => (
                        <tr key={log.id} className="hover:bg-surface-container-high/30 transition-colors text-sm">
                          <td className="px-6 py-3.5 text-xs text-on-surface-variant whitespace-nowrap">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                          </td>
                          <td className="px-6 py-3.5 font-medium text-on-surface uppercase text-xs">
                            {log.operation}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-on-surface-variant font-mono">
                            {log.model}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                log.status === 'success'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-error/15 text-error'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs font-mono text-on-surface">
                            {log.durationMs}ms
                          </td>
                          <td className="px-6 py-3.5 text-xs text-on-surface-variant truncate max-w-xs">
                            {log.error ? (
                              <span className="text-error font-mono">{log.error}</span>
                            ) : (
                              <span className="text-emerald-400">Tokens: {log.tokens || 'N/A'}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── TAB 5: SYSTEM SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Cuisines Editor */}
            <GlassCard className="space-y-4">
              <div className="border-b border-outline-variant/10 pb-3">
                <h3 className="font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">public</span>
                  Supported Cuisines Management
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Manage the official cuisine categories offered across generator dropdowns and filtering tools.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {settings.supportedCuisines.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface text-sm font-medium"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCuisine(c)}
                      className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Remove cuisine"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add new cuisine genre..."
                  value={newCuisine}
                  onChange={(e) => setNewCuisine(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCuisine()}
                  className="flex-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
                />
                <Button variant="secondary" onClick={handleAddCuisine} className="!py-2.5 !px-4 text-xs">
                  Add Cuisine
                </Button>
              </div>
            </GlassCard>

            {/* Dietary Preferences Editor */}
            <GlassCard className="space-y-4">
              <div className="border-b border-outline-variant/10 pb-3">
                <h3 className="font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">spa</span>
                  Supported Dietary Preferences
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Configure dietary restrictions enforced during meal planning and recipe generation.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {settings.supportedDietaryPreferences.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface text-sm font-medium"
                  >
                    <span>{d}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDiet(d)}
                      className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Remove preference"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. pescatarian..."
                  value={newDiet}
                  onChange={(e) => setNewDiet(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDiet()}
                  className="flex-1 bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
                />
                <Button variant="secondary" onClick={handleAddDiet} className="!py-2.5 !px-4 text-xs">
                  Add Dietary
                </Button>
              </div>
            </GlassCard>

            {/* Recipe Generation & Usage Limits */}
            <GlassCard className="space-y-5">
              <div className="border-b border-outline-variant/10 pb-3">
                <h3 className="font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">speed</span>
                  Generation Limits & AI Parameters
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Adjust platform usage limits, guest thresholds, and active Groq model controls.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant text-sm block">
                    Guest Generation Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.recipeGenerationLimits?.guestLimit ?? 2}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        recipeGenerationLimits: {
                          ...prev.recipeGenerationLimits,
                          guestLimit: parseInt(e.target.value, 10) || 1,
                        },
                      }))
                    }
                    className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-xs text-outline">Max recipes a guest can generate prior to signup.</p>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant text-sm block">
                    Max Cooking Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="360"
                    value={settings.recipeGenerationLimits?.maxCookingTimeMinutes ?? 180}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        recipeGenerationLimits: {
                          ...prev.recipeGenerationLimits,
                          maxCookingTimeMinutes: parseInt(e.target.value, 10) || 60,
                        },
                      }))
                    }
                    className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-xs text-outline">Upper bound for stepper controls.</p>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant text-sm block">
                    Default Servings
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.recipeGenerationLimits?.defaultServings ?? 2}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        recipeGenerationLimits: {
                          ...prev.recipeGenerationLimits,
                          defaultServings: parseInt(e.target.value, 10) || 2,
                        },
                      }))
                    }
                    className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-xs text-outline">Initial serving count on new generations.</p>
                </div>
              </div>
            </GlassCard>

            {/* Save / Reset Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Button
                variant="outlined"
                onClick={handleResetSettings}
                disabled={savingSettings}
                className="!py-3 !px-6 text-error hover:bg-error/10 hover:text-error"
              >
                Reset to System Defaults
              </Button>

              <Button
                variant="primary"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="!py-3 !px-8 shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
              >
                {savingSettings ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    <span>Save System Settings</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: EDIT USER ── */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title="Edit User Account"
        >
          <form onSubmit={handleSaveEditUser} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-label-md text-on-surface-variant text-sm block">Full Name</label>
              <input
                type="text"
                value={editingUser.name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-md text-on-surface-variant text-sm block">Email Address</label>
              <input
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-label-md text-on-surface-variant text-sm block">Role</label>
                <select
                  value={editingUser.role || 'user'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  disabled={editingUser.id === currentUser?.id}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-md text-on-surface-variant text-sm block">Verification</label>
                <select
                  value={editingUser.isVerified ? 'true' : 'false'}
                  onChange={(e) => setEditingUser({ ...editingUser, isVerified: e.target.value === 'true' })}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
              <Button type="button" variant="ghost" onClick={() => setEditingUser(null)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingUser} className="flex-1">
                {savingUser ? 'Saving...' : 'Save User'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: CONFIRM DELETE USER ── */}
      {userToDelete && (
        <Modal
          isOpen={Boolean(userToDelete)}
          onClose={() => setUserToDelete(null)}
          title="Confirm User Deletion"
        >
          <div className="space-y-4">
            <p className="text-on-surface">
              Are you sure you want to permanently delete user{' '}
              <strong className="text-primary">{userToDelete.name || userToDelete.email}</strong>?
            </p>
            <p className="text-xs text-error/90 bg-error/10 p-3 rounded-xl border border-error/20">
              Warning: This action will permanently delete all associated recipes, pantry stock, and preferences for this account.
            </p>
            <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
              <Button variant="ghost" onClick={() => setUserToDelete(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmDeleteUser} className="flex-1 !bg-error text-on-error">
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: FLAG RECIPE ── */}
      {flagModalRecipe && (
        <Modal
          isOpen={Boolean(flagModalRecipe)}
          onClose={() => { setFlagModalRecipe(null); setFlagReason(''); }}
          title="Flag Recipe for Content Review"
        >
          <div className="space-y-4">
            <p className="text-on-surface text-sm">
              Flagging <strong className="text-primary">{flagModalRecipe.title}</strong> will place it on the moderation review list and highlight it with a warning.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-medium block">Reason for Flagging:</label>
              <textarea
                rows="3"
                placeholder="e.g. Inappropriate title, hazardous instructions, incorrect ingredients..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl p-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex gap-3 pt-3 border-t border-outline-variant/10">
              <Button variant="ghost" onClick={() => { setFlagModalRecipe(null); setFlagReason(''); }} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveFlagReport} className="flex-1">
                Confirm Flag
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: CONFIRM DELETE RECIPE ── */}
      {recipeToDelete && (
        <Modal
          isOpen={Boolean(recipeToDelete)}
          onClose={() => setRecipeToDelete(null)}
          title="Confirm Recipe Deletion"
        >
          <div className="space-y-4">
            <p className="text-on-surface">
              Are you sure you want to permanently delete recipe{' '}
              <strong className="text-primary">{recipeToDelete.title}</strong>?
            </p>
            <p className="text-xs text-error/90 bg-error/10 p-3 rounded-xl border border-error/20">
              This recipe will be permanently erased along with user favorites and analytics.
            </p>
            <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
              <Button variant="ghost" onClick={() => setRecipeToDelete(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmDeleteRecipe} className="flex-1 !bg-error text-on-error">
                Delete Recipe
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminPanel;

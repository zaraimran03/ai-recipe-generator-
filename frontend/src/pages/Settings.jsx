import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { useToast, Toast } from '../components/ui/Toast';

const PREFERENCE_OPTIONS = ['Mediterranean', 'Asian', 'Italian', 'Mexican', 'Vegan', 'Keto', 'None'];

export const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const { toasts, addToast, removeToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        diet_preference: user.diet_preference || 'None',
        allergies: user.allergies?.join(', ') || '',
        generation: user.generation || '',
        spiceLevel: user.spiceLevel || '',
        cookingSkill: user.cookingSkill || '',
        budgetPreference: user.budgetPreference || '',
        favoriteCuisines: user.favoriteCuisines?.join(', ') || '',
        dislikedIngredients: user.dislikedIngredients?.join(', ') || '',
        notificationsEnabled: user.notificationsEnabled ?? true,
      });
    }
  }, [user, reset]);

  const onSave = async (data) => {
    try {
      setSaving(true);
      // transform comma separated strings to arrays
      const payload = {
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()) : [],
        favoriteCuisines: data.favoriteCuisines ? data.favoriteCuisines.split(',').map(s => s.trim()) : [],
        dislikedIngredients: data.dislikedIngredients ? data.dislikedIngredients.split(',').map(s => s.trim()) : [],
        generation: data.generation === '' ? null : data.generation,
      };
      await updateProfile(payload);
      addToast('Profile updated successfully!', 'success');
    } catch (e) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = ['Profile', 'Preferences', 'Notifications'];

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Settings</h1>
          <p className="text-on-surface-variant font-body-md">Manage your account and preferences</p>
        </div>

        {/* Profile Header */}
        <GlassCard className="!p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-container shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary-container text-2xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-headline-md text-on-surface">{user?.name || user?.username}</h2>
            <p className="text-on-surface-variant font-body-md">{user?.email}</p>
            {user?.is_staff && <span className="mt-1 inline-block px-3 py-1 bg-primary/15 text-primary rounded-full text-label-sm">Admin</span>}
          </div>
        </GlassCard>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg font-label-md text-label-md transition-all ${activeTab === t ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSave)}>
          {activeTab === 'Profile' && (
            <GlassCard>
              <h3 className="font-headline-md text-on-surface mb-6">Profile Information</h3>
              <div className="space-y-5">
                {[
                  { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name', icon: 'person' },
                  { label: 'Email Address', name: 'email', type: 'email', placeholder: 'Your email', icon: 'mail', disabled: true },
                  { label: 'Allergies', name: 'allergies', type: 'text', placeholder: 'Peanuts, gluten, dairy...', icon: 'warning' },
                ].map(f => (
                  <div key={f.name} className="space-y-2">
                    <label className="font-label-md text-on-surface-variant">{f.label}</label>
                    <div className="relative group">
                      <input {...register(f.name)} type={f.type} placeholder={f.placeholder} disabled={f.disabled}
                        className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline disabled:opacity-50"/>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">{f.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === 'Preferences' && (
            <GlassCard>
              <h3 className="font-headline-md text-on-surface mb-6">Cooking Preferences</h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">Dietary Preference</label>
                  <select {...register('diet_preference')}
                    className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface">
                    {PREFERENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">Generation</label>
                  <select {...register('generation')}
                    className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface">
                    <option value="">Prefer not to specify</option>
                    <option value="GEN_Z">Gen Z</option>
                    <option value="MILLENNIAL">Millennial</option>
                    <option value="GEN_X">Gen X</option>
                    <option value="OLDER_ADULT">50+ / Older Adult</option>
                  </select>
                  <p className="text-xs text-on-surface-variant">We'll use this as one of several personalization signals. Your dietary and cooking preferences always take priority.</p>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">Cooking Skill</label>
                  <select {...register('cookingSkill')}
                    className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface">
                    <option value="">Any</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">Spice Level</label>
                  <select {...register('spiceLevel')}
                    className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface">
                    <option value="">Any</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Extra Spicy">Extra Spicy</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">Max Budget (Rs) per meal</label>
                  <div className="relative group">
                    <input {...register('budgetPreference', { valueAsNumber: true })} type="number" placeholder="E.g. 1000"
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline"/>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">payments</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">Favorite Cuisines (comma separated)</label>
                  <div className="relative group">
                    <input {...register('favoriteCuisines')} type="text" placeholder="Pakistani, Italian, Chinese"
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline"/>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">restaurant</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">Disliked Ingredients (comma separated)</label>
                  <div className="relative group">
                    <input {...register('dislikedIngredients')} type="text" placeholder="Mushrooms, Olives"
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline"/>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">block</span>
                  </div>
                </div>

              </div>
            </GlassCard>
          )}

          {activeTab === 'Notifications' && (
            <GlassCard>
              <h3 className="font-headline-md text-on-surface mb-6">Notification Settings</h3>
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                <div>
                  <h4 className="font-label-md text-on-surface">Enable Notifications</h4>
                  <p className="font-label-sm text-on-surface-variant">Receive recipe recommendations and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input {...register('notificationsEnabled')} type="checkbox" className="sr-only peer"/>
                  <div className="w-11 h-6 bg-surface-variant peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </GlassCard>
          )}



          <div className="flex gap-4 mt-6">
            <Button type="submit" variant="primary" className="flex-1 !py-3.5" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="ghost" className="!px-6 !py-3.5 text-error hover:text-error" onClick={logout}>
              <span className="material-symbols-outlined">logout</span> Sign Out
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Settings;

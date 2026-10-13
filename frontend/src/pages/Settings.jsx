import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { useToast, Toast } from '../components/ui/Toast';

const DIET_OPTIONS = [
  { value: 'none', label: 'None (No Restrictions)', icon: 'restaurant', description: 'All recipe types, standard ingredients' },
  { value: 'vegetarian', label: 'Vegetarian', icon: 'spa', description: 'Plant-based with dairy & eggs' },
  { value: 'vegan', label: 'Vegan', icon: 'eco', description: 'Strictly plant-based, no animal products' },
  { value: 'keto', label: 'Keto / Low-Carb', icon: 'bolt', description: 'High-fat, low-carbohydrate meals' },
  { value: 'paleo', label: 'Paleo', icon: 'egg_alt', description: 'Whole foods, lean proteins, veggies' },
  { value: 'gluten_free', label: 'Gluten-Free', icon: 'grain', description: 'Wheat-free, celiac-safe meals' },
  { value: 'dairy_free', label: 'Dairy-Free', icon: 'water_drop', description: 'No lactose, milk, or dairy products' },
  { value: 'halal', label: 'Halal', icon: 'verified', description: 'Permissible under Islamic dietary guidelines' },
  { value: 'low_carb', label: 'Low-Carb', icon: 'fitness_center', description: 'Reduced carbohydrate intake' },
];

const GENERATION_OPTIONS = [
  { value: '', label: 'Prefer not to specify', icon: 'person', description: 'General all-audience recipes' },
  { value: 'GEN_Z', label: 'Gen Z', icon: 'bolt', description: 'Quick, trendy, high-protein & budget-smart recipes' },
  { value: 'MILLENNIAL', label: 'Millennial', icon: 'coffee', description: 'Balanced, nutritious, artisan flavors' },
  { value: 'GEN_X', label: 'Gen X', icon: 'family_restroom', description: 'Hearty, reliable, family-sized dinners' },
  { value: 'OLDER_ADULT', label: '50+ / Older Adult', icon: 'elderly', description: 'Nutrient-dense, comforting classics' },
];

const SKILL_OPTIONS = [
  { value: '', label: 'Any Skill Level', icon: 'all_inclusive', description: 'Recipes of all cooking complexities' },
  { value: 'Beginner', label: 'Beginner', icon: 'skillet', description: 'Basic utensils, easy steps, quick prep' },
  { value: 'Intermediate', label: 'Intermediate', icon: 'soup_kitchen', description: 'Multi-step cooking with varied techniques' },
  { value: 'Expert', label: 'Expert / Master Chef', icon: 'restaurant_menu', description: 'Advanced culinary techniques & precision' },
];

const SPICE_OPTIONS = [
  { value: '', label: 'Any Heat Level', icon: 'all_inclusive', description: 'No spice level restriction' },
  { value: 'Mild', label: 'Mild', icon: 'ac_unit', description: 'Gentle warmth, family-friendly' },
  { value: 'Medium', label: 'Medium', icon: 'local_fire_department', description: 'Noticeable kick with balanced heat' },
  { value: 'Spicy', label: 'Spicy', icon: 'whatshot', description: 'Authentic kick for spice lovers' },
  { value: 'Extra Spicy', label: 'Extra Spicy', icon: 'mode_heat', description: 'Maximum fiery heat and intense peppers' },
];

export const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Preferences');
  const { toasts, addToast, removeToast } = useToast();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      diet_preference: 'none',
      allergies: '',
      generation: '',
      spiceLevel: '',
      cookingSkill: '',
      budgetPreference: '',
      favoriteCuisines: '',
      dislikedIngredients: '',
      notificationsEnabled: true,
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        diet_preference: user.diet_preference || 'none',
        allergies: Array.isArray(user.allergies) ? user.allergies.join(', ') : (user.allergies || ''),
        generation: user.generation || '',
        spiceLevel: user.spiceLevel || '',
        cookingSkill: user.cookingSkill || '',
        budgetPreference: user.budgetPreference !== null && user.budgetPreference !== undefined ? user.budgetPreference : '',
        favoriteCuisines: Array.isArray(user.favoriteCuisines) ? user.favoriteCuisines.join(', ') : (user.favoriteCuisines || ''),
        dislikedIngredients: Array.isArray(user.dislikedIngredients) ? user.dislikedIngredients.join(', ') : (user.dislikedIngredients || ''),
        notificationsEnabled: user.notificationsEnabled ?? true,
      });
    }
  }, [user, reset]);

  const onSave = async (data) => {
    try {
      setSaving(true);
      const parseList = (val) => {
        if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
      };

      const payload = {
        name: data.name !== undefined ? data.name.trim() : (user?.name || ''),
        diet_preference: data.diet_preference || 'none',
        generation: data.generation ? data.generation : null,
        cookingSkill: data.cookingSkill || '',
        spiceLevel: data.spiceLevel || '',
        budgetPreference: data.budgetPreference === '' || data.budgetPreference === null || isNaN(Number(data.budgetPreference))
          ? null
          : Number(data.budgetPreference),
        allergies: parseList(data.allergies),
        favoriteCuisines: parseList(data.favoriteCuisines),
        dislikedIngredients: parseList(data.dislikedIngredients),
        notificationsEnabled: Boolean(data.notificationsEnabled),
      };

      await updateProfile(payload);
      addToast('Preferences & settings saved successfully!', 'success');
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || 'Failed to save settings';
      addToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'Preferences', label: 'Preferences', icon: 'tune' },
    { id: 'Profile', label: 'Profile', icon: 'person' },
    { id: 'Notifications', label: 'Notifications', icon: 'notifications' },
  ];

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Settings</h1>
          <p className="text-on-surface-variant font-body-md">Manage your culinary profile, dietary constraints, and app preferences</p>
        </div>

        {/* Profile Header */}
        <GlassCard className="!p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-container shrink-0 shadow-lg shadow-primary/10">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-on-primary text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-headline-md text-on-surface">{user?.name || user?.username || 'Culinary Explorer'}</h2>
            <p className="text-on-surface-variant font-body-md">{user?.email}</p>
            {user?.is_staff && (
              <span className="mt-1 inline-flex items-center gap-1 px-3 py-1 bg-primary/15 text-primary rounded-full text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">shield</span> Admin
              </span>
            )}
          </div>
        </GlassCard>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 p-1.5 bg-surface-container rounded-2xl w-fit border border-outline-variant/20 shadow-sm">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md text-label-md transition-all duration-200 cursor-pointer ${
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

        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          {/* Preferences Tab */}
          <div className={activeTab === 'Preferences' ? 'space-y-6' : 'hidden'}>
            <GlassCard className="space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <h3 className="font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                  Cooking & Dietary Preferences
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  These settings customize recipe generation, grocery recommendations, and flavor tuning.
                </p>
              </div>

              {/* Dropdowns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Controller
                  name="diet_preference"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="diet_preference"
                      label="Dietary Preference"
                      icon="nutrition"
                      value={field.value}
                      onChange={field.onChange}
                      options={DIET_OPTIONS}
                      helperText="Strictly honored in all AI recipe generations"
                    />
                  )}
                />

                <Controller
                  name="generation"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="generation"
                      label="Generation / Persona"
                      icon="group"
                      value={field.value}
                      onChange={field.onChange}
                      options={GENERATION_OPTIONS}
                      helperText="Personalizes tone, trendiness, and meal portioning"
                    />
                  )}
                />

                <Controller
                  name="cookingSkill"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="cookingSkill"
                      label="Cooking Skill Level"
                      icon="skillet"
                      value={field.value}
                      onChange={field.onChange}
                      options={SKILL_OPTIONS}
                      helperText="Adapts recipe step difficulty and culinary techniques"
                    />
                  )}
                />

                <Controller
                  name="spiceLevel"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="spiceLevel"
                      label="Spice / Heat Level"
                      icon="local_fire_department"
                      value={field.value}
                      onChange={field.onChange}
                      options={SPICE_OPTIONS}
                      helperText="Guides seasoning, chili ratios, and sauces"
                    />
                  )}
                />
              </div>

              {/* Additional Preference Inputs */}
              <div className="pt-2 border-t border-outline-variant/20 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="budgetPreference" className="font-label-md text-on-surface-variant">
                    Max Budget (Rs) per Meal
                  </label>
                  <div className="relative group">
                    <input
                      id="budgetPreference"
                      {...register('budgetPreference')}
                      type="number"
                      placeholder="e.g., 1000"
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-outline text-on-surface"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      payments
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80 pl-1">Leave blank for no budget limit</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="favoriteCuisines" className="font-label-md text-on-surface-variant">
                    Favorite Cuisines (comma separated)
                  </label>
                  <div className="relative group">
                    <input
                      id="favoriteCuisines"
                      {...register('favoriteCuisines')}
                      type="text"
                      placeholder="e.g., Pakistani, Italian, Mediterranean, Thai"
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-outline text-on-surface"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      restaurant
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="dislikedIngredients" className="font-label-md text-on-surface-variant">
                    Disliked Ingredients (comma separated)
                  </label>
                  <div className="relative group">
                    <input
                      id="dislikedIngredients"
                      {...register('dislikedIngredients')}
                      type="text"
                      placeholder="e.g., Mushrooms, Cilantro, Olives"
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-outline text-on-surface"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      block
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80 pl-1">These will be excluded from all generated recommendations</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Profile Tab */}
          <div className={activeTab === 'Profile' ? 'space-y-6' : 'hidden'}>
            <GlassCard>
              <div className="border-b border-outline-variant/20 pb-4 mb-6">
                <h3 className="font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Profile Information
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">Manage your account identity and essential medical allergy exclusions.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="font-label-md text-on-surface-variant">Full Name</label>
                  <div className="relative group">
                    <input
                      id="name"
                      {...register('name')}
                      type="text"
                      placeholder="Your full name"
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-outline text-on-surface"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      person
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="font-label-md text-on-surface-variant">Email Address</label>
                  <div className="relative group">
                    <input
                      id="email"
                      {...register('email')}
                      type="email"
                      disabled
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 placeholder:text-outline text-on-surface opacity-60 cursor-not-allowed"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                      mail
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 pl-1">Email is associated with your authentication account and cannot be modified directly.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="allergies" className="font-label-md text-on-surface-variant">Allergies & Exclusions</label>
                  <div className="relative group">
                    <input
                      id="allergies"
                      {...register('allergies')}
                      type="text"
                      placeholder="e.g., Peanuts, Shellfish, Dairy, Gluten"
                      className="w-full bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-outline text-on-surface"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      warning
                    </span>
                  </div>
                  <p className="text-xs text-error/90 pl-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Recipes will strictly avoid all ingredients matching your allergy list.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Notifications Tab */}
          <div className={activeTab === 'Notifications' ? 'space-y-6' : 'hidden'}>
            <GlassCard>
              <div className="border-b border-outline-variant/20 pb-4 mb-6">
                <h3 className="font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications</span>
                  Notification Settings
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">Configure automated recipe recommendations and reminders.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-high/40 border border-outline-variant/20 rounded-2xl">
                <div>
                  <h4 className="font-label-md text-on-surface font-semibold">Enable Notifications</h4>
                  <p className="font-label-sm text-on-surface-variant">Receive personalized daily recipe suggestions and pantry expiration alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input {...register('notificationsEnabled')} type="checkbox" className="sr-only peer"/>
                  <div className="w-12 h-6.5 bg-surface-container-highest peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>
            </GlassCard>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1 !py-3.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>Save Changes</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="!px-6 !py-3.5 text-error hover:bg-error/10 hover:text-error transition-colors flex items-center gap-2 cursor-pointer"
              onClick={logout}
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign Out</span>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Settings;

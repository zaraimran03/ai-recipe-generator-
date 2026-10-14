import api from './api';

// ── Admin Dashboard & Stats ──────────────────────────────────
export const getStats = async () => {
  const response = await api.get('/admin/stats/');
  return response.data;
};

// ── Admin Users Management ───────────────────────────────────
export const listUsers = async ({ search = '', role = 'all', status = 'all' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role && role !== 'all') params.append('role', role);
  if (status && status !== 'all') params.append('status', status);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/admin/users/${query}`);
  return response.data.results || response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.patch(`/admin/users/${id}/`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}/`);
  return response.data || { success: true };
};

// ── Admin Recipe Management ──────────────────────────────────
export const listAllRecipes = async ({ search = '', status = 'all', cuisine = 'all', userId = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'all') params.append('status', status);
  if (cuisine && cuisine !== 'all') params.append('cuisine', cuisine);
  if (userId) params.append('user_id', userId);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/admin/recipes/${query}`);
  return response.data.results || response.data;
};

export const getRecipeStats = async () => {
  const response = await api.get('/admin/recipes/stats/');
  return response.data;
};

export const updateRecipeStatus = async (id, statusData) => {
  const response = await api.patch(`/admin/recipes/${id}/status/`, statusData);
  return response.data;
};

export const deleteAnyRecipe = async (id) => {
  const response = await api.delete(`/admin/recipes/${id}/`);
  return response.data || { success: true };
};

// ── AI Usage Monitoring ──────────────────────────────────────
export const getAiUsage = async () => {
  const response = await api.get('/admin/ai-usage/');
  return response.data;
};

// ── System Settings ──────────────────────────────────────────
export const getSystemSettings = async () => {
  const response = await api.get('/admin/settings/');
  return response.data;
};

export const updateSystemSettings = async (settings) => {
  const response = await api.put('/admin/settings/', settings);
  return response.data;
};

export const resetSystemSettings = async () => {
  const response = await api.post('/admin/settings/reset/');
  return response.data;
};

export const getPublicSettings = async () => {
  const response = await api.get('/api/settings');
  return response.data;
};

import api from './api';

// Admin Users
export const listUsers = async (search = '') => {
  const url = search ? `/admin/users/?search=${encodeURIComponent(search)}` : '/admin/users/';
  const response = await api.get(url);
  return response.data.results || response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.patch(`/admin/users/${id}/`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  await api.delete(`/admin/users/${id}/`);
  return { success: true };
};

// Admin Recipes
export const listAllRecipes = async (search = '', userId = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (userId) params.append('user_id', userId);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/admin/recipes/${query}`);
  return response.data.results || response.data;
};

export const deleteAnyRecipe = async (id) => {
  await api.delete(`/admin/recipes/${id}/`);
  return { success: true };
};

// Admin Stats
export const getStats = async () => {
  const response = await api.get('/admin/stats/');
  return response.data;
};

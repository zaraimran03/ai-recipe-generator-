import api from './api';

export const getFamilyRecipes = async () => {
  const response = await api.get('/api/family-recipes/');
  return response.data;
};

export const getFamilyRecipeById = async (id) => {
  const response = await api.get(`/api/family-recipes/${id}`);
  return response.data;
};

export const createFamilyRecipe = async (originalText) => {
  const response = await api.post('/api/family-recipes/', { originalText });
  return response.data;
};

export const modernizeFamilyRecipe = async (id, options) => {
  const response = await api.post(`/api/family-recipes/${id}/modernize`, { options });
  return response.data;
};

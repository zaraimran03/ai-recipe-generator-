import api from './api';

export const generateRecipe = async (formData) => {
  // Mapping frontend form to backend expectations
  const payload = {
    ingredients: typeof formData.ingredients === 'string' ? formData.ingredients.split(',').map(i => i.trim()) : formData.ingredients,
    cuisine: formData.cuisine || '',
    taste: formData.taste || '',
    cooking_time: formData.cooking_time || formData.maxTime || 30,
    difficulty: formData.difficulty || 'medium',
    servings: formData.servings || 2,
    dietary_preference: typeof formData.preferences === 'string' ? formData.preferences.split(',').map(i => i.trim()) : (formData.preferences || []),
    allergies: formData.allergies || []
  };

  const response = await api.post('/api/recipes/generate/', payload);
  return response.data;
};

export const getRecipes = async () => {
  const response = await api.get('/api/recipes/');
  return response.data.results || response.data;
};

export const getRecipeById = async (id) => {
  const response = await api.get(`/api/recipes/${id}/`);
  return response.data;
};

export const deleteRecipe = async (id) => {
  await api.delete(`/api/recipes/${id}/`);
  return { success: true };
};

// Favorites
export const getFavorites = async () => {
  const response = await api.get('/api/favorites/');
  const results = response.data.results || response.data;
  return results.map(fav => ({ ...fav.recipe, favoriteId: fav.id }));
};

export const addFavorite = async (recipeId) => {
  await api.post('/api/favorites/', { recipe_id: recipeId });
  return { success: true };
};

export const deleteFavorite = async (recipeId) => {
  // Fetch all favorites to find the right favorite entry ID
  const response = await api.get('/api/favorites/');
  const results = response.data.results || response.data;
  const favorite = results.find(fav => fav.recipe.id === recipeId);
  if (favorite) {
    await api.delete(`/api/favorites/${favorite.id}/`);
  }
  return { success: true };
};

// History
export const getHistory = async () => {
  const response = await api.get('/api/history/');
  const results = response.data.results || response.data;
  return results.map(h => ({
    id: h.id,
    recipeId: h.recipe.id,
    title: h.recipe.title,
    generatedAt: h.generated_at
  }));
};

export const deleteHistory = async (id) => {
  await api.delete(`/api/history/${id}/`);
  return { success: true };
};

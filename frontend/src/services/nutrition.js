import api from './api';

export const getNutritionSummary = async (range = '30d') => {
  const response = await api.get(`/nutrition/summary/?range=${range}`);
  return response.data;
};

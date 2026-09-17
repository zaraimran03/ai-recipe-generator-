import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login/', { email, password });
  
  const { access, refresh, user } = response.data;
  
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
  
  return {
    user: user || { email }, // DRF simplejwt typically doesn't return the full user obj by default unless customized, we'll fetch profile right after in AuthContext if needed. Wait, in earlier step I built users app GET /user/profile, so we'll rely on that.
    accessToken: access,
    refreshToken: refresh
  };
};

export const register = async (name, email, password, confirm_password) => {
  const username = email.split('@')[0];
  await api.post('/auth/register/', { name, username, email, password, confirm_password });
  
  // Auto-login after register
  return await login(email, password);
};

export const logout = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (refresh) {
    try {
      await api.post('/auth/logout/', { refresh });
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  return { success: true };
};

export const getProfile = async () => {
  const response = await api.get('/user/profile/');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const formData = new FormData();
  Object.keys(profileData).forEach(key => {
    if (profileData[key] !== undefined && profileData[key] !== null) {
      formData.append(key, profileData[key]);
    }
  });

  const response = await api.put('/user/profile/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const changePassword = async (current_password, new_password, confirm_password) => {
  const response = await api.post('/user/change-password/', { current_password, new_password, confirm_password });
  return response.data;
};

export const deleteAccount = async () => {
  await api.delete('/user/profile/');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  return { success: true };
};

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
  const response = await api.post('/auth/register', { name, username, email, password, confirm_password });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp/', { email, otp });
  return response.data;
};

export const resendOTP = async (email) => {
  const response = await api.post('/auth/resend-otp/', { email });
  return response.data;
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
  if (profileData instanceof FormData) {
    const response = await api.put('/user/profile/', profileData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Check if any field is a File / Blob
  const hasFile = Object.values(profileData || {}).some(val => val instanceof File || val instanceof Blob);

  if (hasFile) {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      const val = profileData[key];
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          formData.append(key, val.join(', '));
        } else {
          formData.append(key, val);
        }
      }
    });

    const response = await api.put('/user/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Standard JSON update preserves true types (arrays, numbers, nulls)
  const response = await api.put('/user/profile/', profileData);
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

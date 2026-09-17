import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and JWT refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already retried this request
    const isAuthRequest = originalRequest?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        
        // Use a clean axios instance to avoid circular interceptor loops
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken
        });
        
        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem('accessToken', newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error("Refresh token expired or invalid. Logging out.");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

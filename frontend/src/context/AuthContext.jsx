import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken') || null;
  });
  const [loading, setLoading] = useState(true);

  // Sync token and load profile
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedToken && storedRefreshToken) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to load profile, logging out...', error);
          handleLogout();
        }
      } else if (storedToken || storedRefreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
      }
      setLoading(false);
    };
    initAuth();
  }, [accessToken]);

  const handleLogin = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const handleRegister = async (name, email, password, confirm_password) => {
    const data = await authService.register(name, email, password, confirm_password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  };

  const handleUpdateProfile = async (profileData) => {
    const updatedUser = await authService.updateProfile(profileData);
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

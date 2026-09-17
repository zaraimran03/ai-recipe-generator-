import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages (to be implemented)
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import GenerateRecipe from './pages/GenerateRecipe';
import RecipeDetails from './pages/RecipeDetails';
import SavedRecipes from './pages/SavedRecipes';
import Settings from './pages/Settings';
import NutritionAnalytics from './pages/NutritionAnalytics';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes without Layout */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Authenticated Routes with Layout */}
          <Route element={<Layout requireAuth={true} />}>
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/generate" element={
              <ProtectedRoute><GenerateRecipe /></ProtectedRoute>
            } />
            <Route path="/recipe/:id" element={
              <ProtectedRoute><RecipeDetails /></ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute><SavedRecipes /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } />
            <Route path="/nutrition" element={
              <ProtectedRoute><NutritionAnalytics /></ProtectedRoute>
            } />
            
            {/* Admin Only Route */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

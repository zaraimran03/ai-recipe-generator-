import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoutes from './components/layout/ProtectedRoutes';
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
import Pantry from './pages/Pantry';
import FamilyRecipes from './pages/FamilyRecipes';

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
            <Route element={<ProtectedRoutes />}> 
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/generate" element={<GenerateRecipe />} />
              <Route path="/recipe/:id" element={<RecipeDetails />} />
              <Route path="/saved" element={<SavedRecipes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/nutrition" element={<NutritionAnalytics />} />
              <Route path="/pantry" element={<Pantry />} />
              <Route path="/family-recipes" element={<FamilyRecipes />} />
            </Route>
            {/* Admin Only Route */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

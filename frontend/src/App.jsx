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
import OTPVerification from './pages/OTPVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Routes accessible to Guests (use Layout without Sidebar) */}
          <Route element={<Layout requireAuth={false} />}>
            <Route path="/recipe/:id" element={<RecipeDetails />} />
          </Route>

          {/* Authenticated Routes with Layout and Sidebar */}
          <Route element={<Layout requireAuth={true} />}> 
            <Route element={<ProtectedRoutes />}> 
              <Route path="/generate" element={<GenerateRecipe />} />
              <Route path="/dashboard" element={<Dashboard />} />
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

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated } from './api';
import AmbientAnimations from './components/AmbientAnimations';
import LiquidCursor from './components/LiquidCursor';

// i18n
import './i18n';
import { LanguageProvider } from './context/LanguageContext';

// Import components
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AddPlant from './components/AddPlant';
import PlantDetail from './components/PlantDetail';
import AddUpdate from './components/AddUpdate';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import EditUpdate from './components/EditUpdate';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Marketplace from './components/Marketplace';
import Reminders from './components/Reminders';
import PublicPlantDetail from './components/PublicPlantDetail';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Admin Route wrapper
function AdminRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin" replace />;
}

// OAuth Callback handling component
function OAuthCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/dashboard';
    }
  }, []);
  return <div className="min-h-screen flex items-center justify-center text-emerald-400">Authenticating...</div>;
}

import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <LanguageProvider>
      <Router>
        <LiquidCursor />
        <div style={{ minHeight: '100vh', background: 'var(--night)', position: 'relative' }}>
          
          <AmbientAnimations />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LandingPage />
            } />
            <Route path="/login" element={
              isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/register" element={
              isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Register onRegister={handleLogin} />
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* OAuth Callback route */}
            <Route path="/auth-callback" element={<OAuthCallback />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } />
            <Route path="/add-plant" element={
              <ProtectedRoute>
                <AddPlant />
              </ProtectedRoute>
            } />
            <Route path="/plant/:id" element={
              <ProtectedRoute>
                <PlantDetail />
              </ProtectedRoute>
            } />
            <Route path="/plant/:id/add-update" element={
              <ProtectedRoute>
                <AddUpdate />
              </ProtectedRoute>
            } />
            <Route path="/plant/:plantId/update/:updateId/edit" element={
              <ProtectedRoute>
                <EditUpdate />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } />
            <Route path="/reminders" element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            } />
            <Route path="/public/plant/:id" element={<PublicPlantDetail />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;

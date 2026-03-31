import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated } from './api';
import AmbientAnimations from './components/AmbientAnimations';
import LiquidCursor from './components/LiquidCursor';

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

// Protected Route wrapper
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Admin Route wrapper
function AdminRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin" replace />;
}

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
  );
}

export default App;

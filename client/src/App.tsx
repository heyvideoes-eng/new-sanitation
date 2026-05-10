import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import FacilityDetail from './pages/FacilityDetail';
import AdminDashboard from './pages/AdminDashboard';
import CleanerPortal from './pages/CleanerPortal';
import InspectorPortal from './pages/InspectorPortal';
import WelfarePortal from './pages/WelfarePortal';
import BudgetPortal from './pages/BudgetPortal';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

import { SocketProvider } from './context/SocketContext';
import { LiveDataProvider } from './context/LiveDataContext';

import { ToastProvider } from './context/ToastContext';
import InteractiveCursor from './components/UI/InteractiveCursor';

function App() {
  return (
    <ToastProvider>
      <InteractiveCursor />
      <SocketProvider>
        <AuthProvider>
          <LiveDataProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="facility/:id" element={<FacilityDetail />} />
            <Route path="welfare" element={<WelfarePortal />} />
            
            {/* Admin Protected Routes */}
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="budget" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BudgetPortal />
              </ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            } />

            {/* Cleaner Protected Routes */}
            <Route path="cleaner" element={
              <ProtectedRoute allowedRoles={['cleaner', 'admin']}>
                <CleanerPortal />
              </ProtectedRoute>
            } />

            {/* Inspector Protected Routes */}
            <Route path="inspector" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InspectorPortal />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </LiveDataProvider>
    </AuthProvider>
  </SocketProvider>
</ToastProvider>
  );
}

export default App;

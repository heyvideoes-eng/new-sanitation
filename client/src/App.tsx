import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CleanerPortal from './pages/CleanerPortal';
import BudgetPortal from './pages/BudgetPortal';
import AnalyticsPage from './pages/AnalyticsPage';
import QueueInsights from './pages/QueueInsights';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LiveDataProvider } from './context/LiveDataContext';
import { ToastProvider } from './context/ToastContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <SocketProvider>
        <AuthProvider>
          <LiveDataProvider>
            <SearchProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  
                  {/* Operations & Analytics */}
                  <Route path="admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="cleaner" element={
                    <ProtectedRoute allowedRoles={['cleaner', 'admin']}>
                      <CleanerPortal />
                    </ProtectedRoute>
                  } />
                  <Route path="budget" element={<BudgetPortal />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="features/queue" element={<QueueInsights />} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </SearchProvider>
          </LiveDataProvider>
        </AuthProvider>
      </SocketProvider>
    </ToastProvider>
  );
}

export default App;


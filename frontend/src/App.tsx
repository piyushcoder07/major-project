import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastErrorBoundary } from './components/ToastErrorBoundary';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProfilePage,
  UnauthorizedPage,
  MentorSearchPage,
  MentorDetailPage,
  AppointmentsPage,
  MessagingPage,
  AdminPage,
} from './pages';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ToastErrorBoundary>
          <AuthProvider>
            <SocketProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="mentors" element={<MentorSearchPage />} />
                    <Route path="mentors/:id" element={<MentorDetailPage />} />
                    <Route path="appointments" element={<AppointmentsPage />} />
                    <Route path="messages" element={<MessagingPage />} />
                    <Route 
                      path="admin" 
                      element={
                        <ProtectedRoute requiredRole="ADMIN">
                          <AdminPage />
                        </ProtectedRoute>
                      } 
                    />
                    {/* Additional protected routes will be added in future tasks */}
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer />
              </Router>
            </SocketProvider>
          </AuthProvider>
        </ToastErrorBoundary>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

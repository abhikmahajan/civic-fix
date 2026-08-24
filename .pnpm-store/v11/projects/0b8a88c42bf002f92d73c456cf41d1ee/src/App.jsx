import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, PlusCircle, LogIn, LogOut } from 'lucide-react';
import { useOfflineQueue } from './hooks/useOfflineQueue.js';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import OfflineBanner from './components/common/OfflineBanner.jsx';
import ReportPage from './pages/ReportPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import ComplaintPage from './pages/ComplaintPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

function AppContent() {
  const { isOnline, queuedCount } = useOfflineQueue();
  const { user, isAuthenticated, isManagement, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Report', icon: PlusCircle, show: true },
    { path: '/dashboard', label: isManagement ? 'Dashboard' : 'My Complaints', icon: LayoutDashboard, show: isAuthenticated },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <OfflineBanner isOnline={isOnline} queuedCount={queuedCount} />
      
      {/* Navigation bar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">
                BetterBharat <span className="text-blue-600">AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {navItems.filter(i => i.show).map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium text-slate-900">{user?.name}</span>
                    <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors p-2"
                    title="Log Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="flex items-center gap-1 text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors px-2 py-1">
                    <LogIn className="h-4 w-4" /> Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<ReportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
          <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

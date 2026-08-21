import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FlaskConical, PlusCircle } from 'lucide-react';
import { useOfflineQueue } from './hooks/useOfflineQueue.js';
import OfflineBanner from './components/common/OfflineBanner.jsx';
import ReportPage from './pages/ReportPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import ComplaintPage from './pages/ComplaintPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EvaluationPage from './pages/EvaluationPage.jsx';

export default function App() {
  const { isOnline, queuedCount } = useOfflineQueue();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Report', icon: PlusCircle },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/evaluation', label: 'Evaluation', icon: FlaskConical },
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
                CivicFix <span className="text-blue-600">AI</span>
              </span>
            </Link>
            <div className="flex gap-2">
              {navItems.map((item) => {
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
          </div>
        </div>
      </nav>

      {/* Routes */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<ReportPage />} />
          <Route path="/analysis/:id" element={<AnalysisPage />} />
          <Route path="/complaint/:id" element={<ComplaintPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
        </Routes>
      </main>
    </div>
  );
}

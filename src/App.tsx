import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Engagements from './pages/Engagements';
import EngagementDetail from './pages/EngagementDetail';
import Clients from './pages/Clients';
import WorkingPapers from './pages/WorkingPapers';
import AuditPrograms from './pages/AuditPrograms';
import ReviewNotes from './pages/ReviewNotes';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import TrialBalanceImport from './pages/TrialBalanceImport';
import TrialBalances from './pages/TrialBalances';
import Tasks from './pages/Tasks';
import Risks from './pages/Risks';
import TimeTracking from './pages/TimeTracking';
import Billing from './pages/Billing';
import ClientPortal from './pages/ClientPortal';
import Analytics from './pages/Analytics';
import Compliance from './pages/Compliance';

// Offline mode
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
*/

function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user && location.pathname !== '/login') {
      navigate('/login');
    }
    if (user && location.pathname === '/login') {
      navigate('/');
    }
  }, [location, navigate]);

  const currentUser = localStorage.getItem('currentUser')
    ? JSON.parse(localStorage.getItem('currentUser')!)
    : null;

  const menuItems = [
    { path: '/', name: 'Dashboard' },
    { path: '/clients', name: 'Clients' },
    { path: '/engagements', name: 'Engagements' },
    { path: '/tasks', name: 'Tasks' },
    { path: '/risks', name: 'Risks' },
    { path: '/time-tracking', name: 'Time Tracking' },
    { path: '/billing', name: 'Billing' },
    { path: '/working-papers', name: 'Working Papers' },
    { path: '/audit-programs', name: 'Audit Programs' },
    { path: '/review-notes', name: 'Review Notes' },
    { path: '/analytics', name: 'Analytics' },
    { path: '/reports', name: 'Reports' },
    { path: '/trial-balances', name: 'Trial Balances' },
    { path: '/compliance', name: 'Compliance' },
    { path: '/client-portal', name: 'Client Portal' },
    { path: '/users', name: 'Users' },
    { path: '/settings', name: 'Settings' },
  ];

  if (location.pathname === '/login') {
    return <Login />;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 bg-dark text-white p-4" style={{ minHeight: '100vh', position: 'relative' }}>
          <h5 className="mb-5 fw-bold text-red">Price & King Audit</h5>
          <nav className="nav flex-column mb-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link text-white py-1 rounded mb-1 ${
                  location.pathname === item.path ? 'bg-secondary active' : 'hover-bg'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Current User Info */}
          {currentUser && (
            <div className="mt-auto p-3 bg-secondary rounded">
              <small className="d-block text-light">Signed in as</small>
              <div className="fw-bold">{currentUser.name}</div>
              <small className="text-light opacity-75">{currentUser.role}</small>
              <button
                className="btn btn-sm btn-outline-light mt-2 w-100"
                onClick={() => {
                  localStorage.removeItem('currentUser');
                  navigate('/login');
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="col-md-10 p-5 bg-light min-vh-100">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/engagements" element={<Engagements />} />
            <Route path="/engagements/:id" element={<EngagementDetail />} />
            <Route path="/engagements/:id/trial-balance" element={<TrialBalanceImport />} />
            <Route path="/trial-balances" element={<TrialBalances />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/time-tracking" element={<TimeTracking />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/working-papers" element={<WorkingPapers />} />
            <Route path="/audit-programs" element={<AuditPrograms />} />
            <Route path="/review-notes" element={<ReviewNotes />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/client-portal" element={<ClientPortal />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<div className="text-center mt-5"><h3>Page not found</h3></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
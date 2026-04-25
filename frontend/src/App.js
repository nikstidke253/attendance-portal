import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Timesheet from './pages/Timesheet';
import ApplyLeave from './pages/ApplyLeave';
import LeaveApproval from './pages/LeaveApproval';
import UserManagement from './pages/UserManagement';
import LeaveConfiguration from './pages/LeaveConfiguration';
import Navbar from './components/Navbar';
import SessionWarning from './components/SessionWarning';
import { ToastContainer } from './components/Toast';
import './styles/global.css';


// Page Transition Component
const PageTransition = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
};


const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner loading-spinner-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <PageTransition>{children}</PageTransition>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh' }}>
      {isAuthenticated && <Navbar />}
      {isAuthenticated && <SessionWarning />}
      <ToastContainer />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/timesheet" element={<PrivateRoute><Timesheet /></PrivateRoute>} />
          <Route path="/apply-leave" element={<PrivateRoute><ApplyLeave /></PrivateRoute>} />
          <Route path="/leave-approval" element={<PrivateRoute><LeaveApproval /></PrivateRoute>} />
          <Route path="/user-management" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
          <Route path="/leave-config" element={<PrivateRoute><LeaveConfiguration /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
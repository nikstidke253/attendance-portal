import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (!user) return null;
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const getRoleColor = () => {
    if (user.role === 'hr') return '#667eea';
    if (user.role === 'manager') return '#f5576c';
    return '#4facfe';
  };
  
  const getRoleIcon = () => {
    if (user.role === 'hr') return '👑';
    if (user.role === 'manager') return '📊';
    return '👤';
  };
  
  const isActive = (path) => location.pathname === path;
  
  const navLinks = [
    { path: '/dashboard', label: '🏠 Dashboard', roles: ['hr', 'manager', 'employee'] },
    { path: '/attendance', label: '✅ Attendance', roles: ['employee', 'manager'] },
    { path: '/apply-leave', label: '📝 Apply Leave', roles: ['employee', 'manager'] },
    { path: '/timesheet', label: '📊 Timesheet', roles: ['hr', 'manager', 'employee'] },
    { path: '/leave-approval', label: '✓ Approve Leaves', roles: ['manager'] },
    { path: '/user-management', label: '👥 Manage Users', roles: ['hr'] },
    { path: '/leave-config', label: '⚙️ Leave Config', roles: ['hr'] },
  ];
  
  const visibleLinks = navLinks.filter(link => link.roles.includes(user.role));
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="nav-logo animate-float">📋</div>
          <h1 className="nav-title">Attendance Portal</h1>
        </div>
        
        <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {visibleLinks.map((link, index) => (
            <button
              key={link.path}
              className="nav-link"
              onClick={() => navigate(link.path)}
              style={{
                background: isActive(link.path) ? `rgba(${getRoleColor()}, 0.1)` : 'none',
                color: isActive(link.path) ? getRoleColor() : '#555'
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
        
        <div className="nav-user">
          <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${getRoleColor()}, ${getRoleColor()}cc)` }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span className="user-info">
            {getRoleIcon()} {user.username} ({user.role.toUpperCase()})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
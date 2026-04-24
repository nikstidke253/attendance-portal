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
  
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['hr', 'manager', 'employee'] },
    { path: '/attendance', label: 'Attendance', icon: '✅', roles: ['employee', 'manager'] },
    { path: '/apply-leave', label: 'Apply Leave', icon: '📝', roles: ['employee', 'manager'] },
    { path: '/timesheet', label: 'Timesheet', icon: '📊', roles: ['hr', 'manager', 'employee'] },
    { path: '/leave-approval', label: 'Approve', icon: '✓', roles: ['manager'] },
    { path: '/user-management', label: 'Users', icon: '👥', roles: ['hr'] },
    { path: '/leave-config', label: 'Config', icon: '⚙️', roles: ['hr'] },
  ];
  
  const visibleLinks = navLinks.filter(link => link.roles.includes(user.role));
  
  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${getRoleColor()}, ${getRoleColor()}cc)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>📋</div>
          <h2 style={{
            background: `linear-gradient(135deg, ${getRoleColor()}, ${getRoleColor()}cc)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { base: '18px', md: '20px' },
            margin: 0
          }}>Attendance Portal</h2>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px'
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
        
        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
        className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {visibleLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setMobileMenuOpen(false);
              }}
              style={{
                padding: '8px 16px',
                background: location.pathname === link.path ? `linear-gradient(135deg, ${getRoleColor()}15, ${getRoleColor()}10)` : 'none',
                color: location.pathname === link.path ? getRoleColor() : '#555',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: location.pathname === link.path ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s'
              }}
            >
              <span>{link.icon}</span>
              <span className="hide-on-mobile">{link.label}</span>
            </button>
          ))}
        </div>
        
        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#f8f9fa',
          padding: '6px 16px',
          borderRadius: '40px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getRoleColor()}, ${getRoleColor()}cc)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: getRoleColor()
          }}>
            {getRoleIcon()} {user.username}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
      
      {/* Mobile Styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .nav-links {
            display: none;
            width: 100%;
            flex-direction: column;
            gap: 8px;
            padding: 15px 0;
          }
          
          .nav-links.open {
            display: flex;
          }
          
          .nav-links button {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (min-width: 769px) {
          .nav-links {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
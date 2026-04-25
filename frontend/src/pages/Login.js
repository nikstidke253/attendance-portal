import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('hr');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const roleCredentials = {
    hr: { 
      username: 'hr_user', 
      password: 'password123', 
      name: 'HR Administrator', 
      icon: '👑', 
      bg: '#667eea', 
      light: '#f0f4ff',
      title: 'HR Management Portal',
      description: 'Manage employees, configure leave types, and oversee organization attendance',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      features: ['User Management', 'Leave Configuration', 'Organization Reports', 'Approve Requests']
    },
    manager: { 
      username: 'manager_user', 
      password: 'password123', 
      name: 'Team Manager', 
      icon: '📊', 
      bg: '#f5576c', 
      light: '#fff0f2',
      title: 'Team Management Portal',
      description: 'Manage your team, approve leave requests, and track team attendance',
      image: 'https://cdn-icons-png.flaticon.com/512/1998/1998592.png',
      features: ['Team Attendance', 'Leave Approvals', 'Team Performance', 'Employee Reports']
    },
    employee: { 
      username: 'emp_user', 
      password: 'password123', 
      name: 'Employee', 
      icon: '👤', 
      bg: '#4facfe', 
      light: '#f0f8ff',
      title: 'Employee Self Service Portal',
      description: 'Mark attendance, apply for leave, and track your leave history',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
      features: ['Mark Attendance', 'Apply Leave', 'View Timesheet', 'Leave History']
    }
  };
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    
    // Check if login was successful and role matches
    if (result === true || result?.success) {
      // We need to check the user role from localStorage or context if it's not returned in result
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.role !== selectedRole) {
        // Logout if role doesn't match
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError(`Access denied. Please login using an ${selectedRole.toUpperCase()} account.`);
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result?.error || 'Invalid username or password');
    }
  };

  
  const currentRole = roleCredentials[selectedRole];
  
  // Responsive styles
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
  
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f0f2f5',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      {/* Left Side - Brand Section with Role Image */}
      <div style={{
        flex: isMobile ? 'auto' : 1.2,
        background: `linear-gradient(135deg, ${currentRole.bg}dd, ${currentRole.bg})`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '30px 20px' : '48px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }} />
        
        <div style={{
          textAlign: 'center',
          maxWidth: isMobile ? '100%' : '450px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            marginBottom: isMobile ? '20px' : '32px'
          }}>
            <img 
              src={currentRole.image} 
              alt={currentRole.name}
              style={{
                width: isMobile ? '100px' : (isTablet ? '140px' : '180px'),
                height: 'auto',
                filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.2))',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
                padding: isMobile ? '15px' : '20px'
              }}
            />
          </div>
          
          <h1 style={{
            fontSize: isMobile ? '22px' : (isTablet ? '28px' : '32px'),
            fontWeight: '700',
            marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            {currentRole.title}
          </h1>
          
          <p style={{
            fontSize: isMobile ? '12px' : '14px',
            lineHeight: '1.6',
            opacity: 0.9,
            marginBottom: isMobile ? '20px' : '32px'
          }}>
            {currentRole.description}
          </p>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? '8px' : '12px',
            justifyContent: 'center',
            marginBottom: isMobile ? '25px' : '40px'
          }}>
            {currentRole.features.map((feature, index) => (
              <span key={index} style={{
                background: 'rgba(255,255,255,0.2)',
                padding: isMobile ? '4px 10px' : '6px 14px',
                borderRadius: '50px',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: '500'
              }}>
                ✓ {feature}
              </span>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            gap: isMobile ? '20px' : '40px',
            justifyContent: 'center',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700' }}>500+</div>
              <div style={{ fontSize: isMobile ? '9px' : '11px', opacity: 0.8 }}>Active Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700' }}>1000+</div>
              <div style={{ fontSize: isMobile ? '9px' : '11px', opacity: 0.8 }}>Daily Check-ins</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700' }}>98%</div>
              <div style={{ fontSize: isMobile ? '9px' : '11px', opacity: 0.8 }}>Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div style={{
        flex: isMobile ? 'auto' : 0.8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '30px 20px' : '48px',
        background: 'white'
      }}>
        <div style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '420px'
        }}>
          <div style={{ marginBottom: isMobile ? '24px' : '32px', textAlign: 'center' }}>
            <div style={{
              fontSize: isMobile ? '40px' : '48px',
              marginBottom: '16px'
            }}>
              {currentRole.icon}
            </div>
            <h2 style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '700',
              color: '#1a1a2e',
              marginBottom: '8px'
            }}>
              Welcome Back
            </h2>
            <p style={{ color: '#666', fontSize: isMobile ? '12px' : '13px' }}>
              Sign in to your {currentRole.name} account
            </p>
          </div>
          
          {/* Role Selector Tabs */}
          <div style={{
            display: 'flex',
            gap: isMobile ? '6px' : '12px',
            marginBottom: isMobile ? '24px' : '32px',
            background: '#f8f9fa',
            padding: '6px',
            borderRadius: '16px'
          }}>
            {Object.entries(roleCredentials).map(([key, role]) => (
              <button
                key={key}
                onClick={() => handleRoleSelect(key)}
                style={{
                  flex: 1,
                  padding: isMobile ? '10px 4px' : '12px 8px',
                  background: selectedRole === key ? role.bg : 'transparent',
                  color: selectedRole === key ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: isMobile ? '14px' : '16px' }}>{role.icon}</span>
                <span>{role.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
          
          {error && (
            <div style={{
              background: '#fee',
              color: '#c00',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '13px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '13px',
                color: '#333'
              }}>
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: isMobile ? '13px' : '14px',
                  transition: 'all 0.2s',
                  background: '#fafafa'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = currentRole.bg;
                  e.target.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = '#fafafa';
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '13px',
                color: '#333'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: isMobile ? '13px' : '14px',
                  transition: 'all 0.2s',
                  background: '#fafafa'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = currentRole.bg;
                  e.target.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.background = '#fafafa';
                }}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: isMobile ? '12px' : '14px',
                background: currentRole.bg,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && !isMobile) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!loading && !isMobile) e.currentTarget.style.opacity = '1';
              }}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
          
          {/* Demo Credentials */}
          <div style={{
            marginTop: '32px',
            padding: isMobile ? '12px' : '16px',
            background: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center',
            border: `1px solid ${currentRole.bg}30`
          }}>
            <p style={{
              fontSize: isMobile ? '10px' : '11px',
              color: '#999',
              marginBottom: '10px',
              letterSpacing: '0.5px'
            }}>
              🔐 DEMO CREDENTIALS
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: isMobile ? '10px' : '11px',
              color: '#666'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ color: '#667eea' }}>👑 HR:</span>
                <span>hr_user</span>
                <span>••••••••</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ color: '#f5576c' }}>📊 Manager:</span>
                <span>manager_user</span>
                <span>••••••••</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ color: '#4facfe' }}>👤 Employee:</span>
                <span>emp_user</span>
                <span>••••••••</span>
              </div>
            </div>
            <p style={{
              fontSize: isMobile ? '9px' : '10px',
              color: '#bbb',
              marginTop: '10px',
              marginBottom: 0
            }}>
              Password for all: <strong>password123</strong>
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
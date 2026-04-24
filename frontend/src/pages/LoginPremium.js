import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPremium = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredRole, setHoveredRole] = useState(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const roles = [
    { id: 'hr', username: 'hr_user', password: 'password123', name: 'HR Administrator', icon: '👑', color: '#667eea', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', description: 'Full system access' },
    { id: 'manager', username: 'manager_user', password: 'password123', name: 'Team Manager', icon: '📊', color: '#f5576c', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', description: 'Team management & approvals' },
    { id: 'employee', username: 'emp_user', password: 'password123', name: 'Employee', icon: '👤', color: '#4facfe', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', description: 'Self-service portal' }
  ];
  
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setUsername(role.username);
    setPassword(role.password);
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
    const success = await login(username, password);
    setLoading(false);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e1b4b, #0f0c29)',
      padding: '20px',
      fontFamily: "'Inter', 'Poppins', sans-serif"
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1200px',
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '40px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Left Side - Branding */}
        <div style={{
          background: `linear-gradient(135deg, ${selectedRole.color}20, ${selectedRole.color}05)`,
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '24px',
            animation: 'float 3s ease-in-out infinite'
          }}>
            📋
          </div>
          <h2 style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '16px'
          }}>
            Attendance Portal
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Manage attendance, leaves, and team performance all in one place.
          </p>
          
          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>500+</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Active Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>1000+</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Daily Check-ins</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>98%</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Satisfaction</div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div style={{
          padding: '48px',
          background: 'rgba(255,255,255,0.95)'
        }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '800',
              background: selectedRole.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Welcome Back!
            </h3>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
              Sign in to continue to your account
            </p>
          </div>
          
          {/* Role Selector */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '32px',
            justifyContent: 'center'
          }}>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: selectedRole.id === role.id ? role.gradient : '#f5f5f5',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: selectedRole.id === role.id || hoveredRole === role.id ? 'translateY(-2px)' : 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{role.icon}</div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: selectedRole.id === role.id ? 'white' : '#666'
                }}>
                  {role.name.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
          
          {error && (
            <div style={{
              background: '#fee',
              color: '#c00',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '20px',
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
                  padding: '14px 16px',
                  border: `2px solid ${selectedRole.id === 'hr' ? '#e0e0e0' : '#e0e0e0'}`,
                  borderRadius: '14px',
                  fontSize: '14px',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = selectedRole.color}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
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
                  padding: '14px 16px',
                  border: `2px solid ${selectedRole.id === 'hr' ? '#e0e0e0' : '#e0e0e0'}`,
                  borderRadius: '14px',
                  fontSize: '14px',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = selectedRole.color}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: selectedRole.gradient,
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  🔓 Login to {selectedRole.name}
                </>
              )}
            </button>
          </form>
          
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>
              Demo Mode • Credentials are pre-filled • Click login to continue
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPremium;
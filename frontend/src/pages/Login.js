import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('hr'); // hr, manager, employee
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const roleInfo = {
    hr: {
      title: 'HR Management Portal',
      desc: 'Centralized command for organization workforce, attendance, and leave policies.',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      features: ['Organization Analytics', 'User Management', 'Leave Configuration'],
      color: '#667eea'
    },
    manager: {
      title: 'Team Management Portal',
      desc: 'Empower your team, track real-time attendance, and manage leave approvals.',
      image: 'https://cdn-icons-png.flaticon.com/512/1998/1998592.png',
      features: ['Team Performance', 'Quick Approvals', 'Attendance Trends'],
      color: '#f5576c'
    },
    employee: {
      title: 'Self Service Portal',
      desc: 'Seamlessly mark attendance, apply for leave, and view your personal records.',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
      features: ['Instant Check-in', 'Leave History', 'Holiday Calendar'],
      color: '#4facfe'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter your credentials');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    
    if (result === true || result?.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.role !== selectedRole) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError(`Invalid credentials for ${selectedRole.toUpperCase()} login.`);
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result?.error || 'Invalid username or password');
      setLoading(false);
    }
  };

  const current = roleInfo[selectedRole];

  return (
    <div className="fade-in" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      padding: '20px'
    }}>
      <div className="shadow-lg overflow-hidden d-flex flex-column flex-md-row" style={{ 
        maxWidth: '1000px', 
        width: '100%', 
        background: 'white', 
        borderRadius: '30px'
      }}>
        
        {/* LEFT SIDE - Dynamic Content */}
        <div style={{ 
          flex: 1, 
          background: `linear-gradient(135deg, ${current.color} 0%, #1e293b 100%)`, 
          padding: '50px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <img 
            src={current.image} 
            alt="Role Icon" 
            className="mb-4"
            style={{ width: '120px', height: '120px', margin: '0 auto', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }} 
          />
          <h2 className="fw-bold mb-3">{current.title}</h2>
          <p className="opacity-75 mb-4">{current.desc}</p>
          <div className="text-start mt-2">
            {current.features.map((f, i) => (
              <div key={i} className="mb-2 d-flex align-items-center gap-2">
                <span style={{ fontSize: '18px' }}>✓</span>
                <span className="small fw-bold">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div style={{ flex: 1.2, padding: '50px', background: 'white' }}>
          <div className="text-center mb-5">
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>
              {selectedRole === 'hr' ? '👑' : (selectedRole === 'manager' ? '📊' : '👤')}
            </div>
            <h2 className="fw-bold text-dark">Welcome Back</h2>
            <p className="text-muted small">Sign in to your {selectedRole === 'manager' ? 'Team' : (selectedRole === 'hr' ? 'HR' : 'Employee')} account</p>
          </div>


          {/* ROLE TABS */}
          <div className="d-flex mb-5" style={{ 
            background: '#f1f5f9', 
            borderRadius: '20px', 
            padding: '8px',
            gap: '10px'
          }}>
            {[
              { id: 'hr', label: 'HR', icon: '👑' },
              { id: 'manager', label: 'Team', icon: '📊' },
              { id: 'employee', label: 'Employee', icon: '👤' }
            ].map(tab => (
              <button 
                key={tab.id}
                type="button"
                onClick={() => { setSelectedRole(tab.id); setError(''); }}
                className="btn border-0 py-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                style={{ 
                  borderRadius: '16px',
                  background: selectedRole === tab.id ? 'white' : 'transparent',
                  color: '#1e293b',
                  fontWeight: '800',
                  fontSize: '14px',
                  boxShadow: selectedRole === tab.id ? '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedRole === tab.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>


          {error && (
            <div className="alert alert-danger border-0 small mb-4 py-2" style={{ borderRadius: '10px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">USERNAME</label>
              <input 
                type="text" 
                className="form-control border-0 bg-light p-3" 
                style={{ borderRadius: '12px' }}
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label className="form-label small fw-bold text-muted">PASSWORD</label>
              <input 
                type="password" 
                className="form-control border-0 bg-light p-3" 
                style={{ borderRadius: '12px' }}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 p-3 fw-bold" 
              disabled={loading}
              style={{ 
                background: `linear-gradient(135deg, ${current.color} 0%, #1e293b 100%)`, 
                border: 'none', 
                borderRadius: '12px',
                boxShadow: `0 10px 15px ${current.color}33`
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
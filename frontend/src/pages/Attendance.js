import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { showToast } from '../components/Toast';

const Attendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ hasCheckedIn: false, hasCheckedOut: false, checkInTime: null, checkOutTime: null });
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      const attRes = await api.get('/attendance/my');
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attRes.data.find(r => r.date === today);
      
      setStatus({
        ...res.data,
        checkInTime: todayRecord?.checkIn || '00:00',
        checkOutTime: todayRecord?.checkOut || '00:00'
      });
    } catch (err) {
      console.error('Error fetching attendance status:', err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkin');
      showToast('Checked in successfully!', 'success');
      fetchStatus();
    } catch (err) {
      showToast(err.response?.data?.error || 'Check-in failed.', 'error');
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkout');
      showToast('Checked out successfully!', 'success');
      fetchStatus();
    } catch (err) {
      showToast(err.response?.data?.error || 'Check-out failed.', 'error');
    }
    setLoading(false);
  };

  const calculateTotalHrs = (inTime, outTime) => {
    if (!inTime || inTime === '00:00' || !outTime || outTime === '00:00') return '00:00 hours';
    try {
      const start = new Date(`1970-01-01 ${inTime}`);
      const end = new Date(`1970-01-01 ${outTime}`);
      let diff = (end - start) / 1000 / 60 / 60;
      if (diff < 0) diff += 24;
      const hrs = Math.floor(diff);
      const mins = Math.round((diff - hrs) * 60);
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} hours`;
    } catch {
      return '00:00 hours';
    }
  };

  const todayDate = time.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });

  // Role Based Theme Configuration
  const getTheme = () => {
    if (user?.role === 'hr') return {
      main: '#667eea',
      bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      btn: status.hasCheckedOut ? '#94a3b8' : (!status.hasCheckedIn ? '#667eea' : '#7c3aed'),
      accent: '#7c3aed',
      label: '👑 HR Administrator',
      glow: 'rgba(102, 126, 234, 0.2)'
    };
    if (user?.role === 'manager') return {
      main: '#f5576c',
      bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      btn: status.hasCheckedOut ? '#cbd5e1' : (!status.hasCheckedIn ? '#f5576c' : '#f43f5e'),
      accent: '#f43f5e',
      label: '📊 Team Manager',
      glow: 'rgba(245, 87, 108, 0.2)'
    };
    return {
      main: '#4facfe',
      bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      btn: status.hasCheckedOut ? '#94a3b8' : (!status.hasCheckedIn ? '#4facfe' : '#0ea5e9'),
      accent: '#00f2fe',
      label: '👤 Employee',
      glow: 'rgba(79, 172, 254, 0.2)'
    };
  };

  const theme = getTheme();

  return (
    <div className="fade-in" style={{ minHeight: '100vh', background: theme.bg, padding: '20px' }}>
      <div style={{ maxWidth: '450px', margin: '0 auto' }}>
        {/* Header Clock */}
        <div className="text-center mb-5 mt-4">
          <div className="badge mb-2" style={{ background: theme.main, padding: '6px 16px', borderRadius: '20px' }}>{theme.label}</div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: theme.main, margin: 0, letterSpacing: '2px' }}>
            {timeStr}
          </h1>
          <p style={{ color: '#64748b', fontWeight: '600', fontSize: '16px' }}>
            {todayDate} {dayName}
          </p>
        </div>

        {/* Main Circular Button */}
        <div className="d-flex justify-content-center mb-5">
          <div 
            onClick={!status.hasCheckedIn ? handleCheckIn : (!status.hasCheckedOut ? handleCheckOut : null)}
            className={`attendance-btn ${!status.hasCheckedOut ? 'float-anim' : ''}`}
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: theme.btn,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: loading || status.hasCheckedOut ? 'default' : 'pointer',
              boxShadow: `0 0 0 15px ${theme.glow}`,
              transition: 'all 0.3s ease',
              border: 'none',
              position: 'relative'
            }}
          >
            {loading ? (
              <div className="spinner-border" role="status"></div>
            ) : (
              <>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                  {status.hasCheckedOut ? '✨' : (user?.role === 'hr' ? '🔑' : (user?.role === 'manager' ? '📊' : '👆'))}
                </div>
                <span style={{ fontSize: '22px', fontWeight: '700' }}>
                  {status.hasCheckedOut ? 'Done' : (!status.hasCheckedIn ? 'Check In' : 'Check Out')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats Circles */}
        <div className="row g-0 text-center mb-5 px-2">
          {[
            { label: 'Check In', value: status.checkInTime, icon: '📥' },
            { label: 'Check Out', value: status.checkOutTime, icon: '📤' },
            { label: 'Total Hrs', value: calculateTotalHrs(status.checkInTime, status.checkOutTime).split(' ')[0], icon: '⏱️' }
          ].map((s, i) => (
            <div className="col-4" key={i}>
              <div style={{ padding: '5px' }}>
                <div className="stat-circle" style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', border: `3px solid ${theme.main}`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                  color: theme.main, fontSize: '20px'
                }}>
                  {s.icon}
                </div>
                <div className="stat-value" style={{ fontWeight: '800', color: theme.main, fontSize: '15px' }}>{s.value}</div>
                <div className="stat-label" style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Announcements / Bottom Section */}
        <div className="px-2">
          <div className="card border-0 p-4 shadow-sm" style={{ borderRadius: '24px', background: 'white' }}>
            <h5 className="fw-bold mb-3" style={{ color: theme.main }}>{user?.role === 'hr' ? 'Admin Bulletin' : (user?.role === 'manager' ? 'Team Notice' : 'Announcements')}</h5>
            <div className="d-flex align-items-start gap-3">
              <div style={{ fontSize: '24px' }}>📢</div>
              <div>
                <div className="fw-bold" style={{ fontSize: '14px' }}>Upcoming Holiday</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>May 1st - Workers Day Office remains closed.</div>
              </div>
            </div>
          </div>
        </div>

        <button className="btn btn-link mt-4 w-100 text-decoration-none" onClick={() => navigate('/dashboard')} style={{ color: theme.main, fontWeight: '700' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Attendance;
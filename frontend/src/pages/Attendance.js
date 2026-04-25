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
      // Backend returns { hasCheckedIn, hasCheckedOut }
      // We might need actual times from the attendance record
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

  return (
    <div className="fade-in" style={{ maxWidth: '450px', margin: '0 auto', padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header Clock */}
      <div className="text-center mb-5 mt-4">
        <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#1a3c34', margin: 0, letterSpacing: '2px' }}>
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
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: status.hasCheckedOut ? '#cbd5e1' : (!status.hasCheckedIn ? '#10b981' : '#f43f5e'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: loading || status.hasCheckedOut ? 'default' : 'pointer',
            boxShadow: '0 0 0 15px rgba(244, 63, 94, 0.1)',
            transition: 'all 0.3s ease',
            border: 'none',
            position: 'relative'
          }}
          className={!status.hasCheckedOut ? 'float-anim' : ''}
        >
          {loading ? (
            <div className="spinner-border" role="status"></div>
          ) : (
            <>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                {status.hasCheckedOut ? '✅' : '👆'}
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
        <div className="col-4">
          <div style={{ padding: '10px' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #1a3c34', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
              color: '#1a3c34', fontSize: '20px'
            }}>
              📥
            </div>
            <div style={{ fontWeight: '800', color: '#1a3c34', fontSize: '15px' }}>{status.checkInTime}</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Check In</div>
          </div>
        </div>
        <div className="col-4">
          <div style={{ padding: '10px' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #1a3c34', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
              color: '#1a3c34', fontSize: '20px'
            }}>
              📤
            </div>
            <div style={{ fontWeight: '800', color: '#1a3c34', fontSize: '15px' }}>{status.checkOutTime}</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Check Out</div>
          </div>
        </div>
        <div className="col-4">
          <div style={{ padding: '10px' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #1a3c34', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
              color: '#1a3c34', fontSize: '20px'
            }}>
              ✔️
            </div>
            <div style={{ fontWeight: '800', color: '#1a3c34', fontSize: '15px' }}>
              {calculateTotalHrs(status.checkInTime, status.checkOutTime).split(' ')[0]}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Total Hrs</div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="px-2">
        <h3 className="fw-bold mb-3" style={{ fontSize: '24px', color: '#1a3c34' }}>Announcement's</h3>
        <div className="card border-0 p-4" style={{ borderRadius: '20px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div className="fw-bold mb-2" style={{ color: '#1a3c34', fontSize: '16px' }}>Event Related</div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Date : 15/Apr/2024 To 20/Apr/2024
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
            Upcoming Company Annual Meetup and Team Building Event.
          </div>
        </div>
      </div>

      <button className="btn btn-link mt-4 w-100 text-decoration-none" onClick={() => navigate('/dashboard')} style={{ color: '#64748b' }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default Attendance;
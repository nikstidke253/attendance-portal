import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Attendance = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ hasCheckedIn: false, hasCheckedOut: false });
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
      setStatus(res.data);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };
  
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkin');
      alert('✅ Checked in successfully!');
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed');
    }
    setLoading(false);
  };
  
  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkout');
      alert('✅ Checked out successfully!');
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-out failed');
    }
    setLoading(false);
  };
  
  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '600px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark">
          <i className="fas fa-clock text-primary me-2"></i>
          Attendance
        </h2>
        <button className="btn btn-outline-secondary shadow-sm" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left me-2"></i>Back
        </button>
      </div>

      <div className="card glass-card border-0 text-center py-5">
        <div className="card-body">
          <div className="mb-4">
            <h1 className="fw-bold text-primary display-4" style={{ letterSpacing: '2px' }}>
              {time.toLocaleTimeString()}
            </h1>
            <p className="text-muted fw-semibold fs-5">
              {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="mt-5">
            {!status.hasCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="btn btn-success btn-lg px-5 py-3 rounded-pill shadow"
                style={{ fontSize: '1.2rem' }}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                {loading ? 'Processing...' : 'Check In Now'}
              </button>
            ) : !status.hasCheckedOut ? (
              <div>
                <div className="alert alert-success d-inline-block mb-4 px-4 py-2 rounded-pill border-0 shadow-sm">
                  <i className="fas fa-check-circle me-2"></i>You are currently checked in.
                </div>
                <br />
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="btn btn-danger btn-lg px-5 py-3 rounded-pill shadow"
                  style={{ fontSize: '1.2rem' }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  {loading ? 'Processing...' : 'Check Out'}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-success-soft rounded-4 border-0">
                <i className="fas fa-calendar-check text-success display-4 mb-3"></i>
                <h3 className="fw-bold text-success mb-2">Great job!</h3>
                <p className="text-dark mb-0 fs-5">You have completed your attendance for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
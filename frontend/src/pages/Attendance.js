import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [status, setStatus] = useState({ hasCheckedIn: false, hasCheckedOut: false });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchStatus();
  }, []);
  
  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/today`);
      setStatus(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/checkin`);
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
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/checkout`);
      alert('✅ Checked out successfully!');
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-out failed');
    }
    setLoading(false);
  };
  
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
      <h3>Today's Attendance</h3>
      <div style={{ marginTop: '30px' }}>
        {!status.hasCheckedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              background: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            ✅ Check In
          </button>
        ) : !status.hasCheckedOut ? (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              background: '#ed8936',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            ⏹️ Check Out
          </button>
        ) : (
          <div>
            <p style={{ fontSize: '18px', color: 'green' }}>✓ Attendance Completed</p>
            <p>Check In: {status.checkIn && new Date(status.checkIn).toLocaleTimeString()}</p>
            <p>Check Out: {status.checkOut && new Date(status.checkOut).toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
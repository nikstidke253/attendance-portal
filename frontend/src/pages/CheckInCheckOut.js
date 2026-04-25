// Redirects to the main Attendance page which handles check-in and check-out.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckInCheckOut() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/attendance', { replace: true });
  }, [navigate]);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner-border text-primary" style={{ width: '40px', height: '40px' }} role="status"></div>
        <p className="mt-3 text-muted" style={{ fontSize: '14px' }}>Redirecting to Attendance...</p>
      </div>
    </div>
  );
}
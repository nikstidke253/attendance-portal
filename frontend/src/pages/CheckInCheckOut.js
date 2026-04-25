// This component redirects to the main Attendance page which handles both check-in and check-out.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckInCheckOut() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/attendance');
  }, [navigate]);
  return null;
}
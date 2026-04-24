import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SessionWarning = () => {
  const { isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let timer;
    let warningTimer;
    
    // Show warning at 13 minutes (2 minutes before timeout)
    warningTimer = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(120);
      
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowWarning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 13 * 60 * 1000);
    
    return () => {
      clearTimeout(warningTimer);
      clearInterval(timer);
    };
  }, [isAuthenticated]);
  
  if (!showWarning) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease'
    }}>
      <strong>⏰ Session Timeout Warning</strong>
      <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
        Your session will expire in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} minutes due to inactivity.
      </p>
    </div>
  );
};

export default SessionWarning;
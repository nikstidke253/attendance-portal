import React, { useState, useEffect } from 'react';

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

const colors = {
  success: { bg: 'linear-gradient(135deg, #10b981, #059669)', border: '#10b981' },
  error:   { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', border: '#ef4444' },
  warning: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '#f59e0b' },
  info:    { bg: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: '#4f46e5' }
};

let toastId = 0;
let globalAddToast = null;

export const showToast = (message, type = 'info') => {
  if (globalAddToast) globalAddToast({ id: ++toastId, message, type });
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    globalAddToast = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3500);
    };
    return () => { globalAddToast = null; };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: colors[toast.type]?.bg || colors.info.bg,
          color: 'white',
          padding: '14px 20px',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          minWidth: '280px',
          maxWidth: '380px',
          pointerEvents: 'all',
          animation: 'toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{ fontSize: '20px' }}>{icons[toast.type]}</span>
          <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>{toast.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(80px) scale(0.8); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;

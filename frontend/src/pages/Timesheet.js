import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Timesheet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let res;
      if (user?.role === 'hr' || user?.role === 'manager') {
        res = await api.get('/attendance');
      } else {
        res = await api.get('/attendance/my');
      }
      setAttendance(res.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    try {
      const start = new Date(`1970-01-01 ${checkIn}`);
      const end   = new Date(`1970-01-01 ${checkOut}`);
      let diff = (end - start) / 1000 / 60 / 60;
      if (diff < 0) diff += 24;
      return diff;
    } catch {
      return null;
    }
  };

  const formatHrs = (h) => {
    if (h === null) return '0 hrs.';
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    if (mins === 0) return `${hrs} hrs.`;
    return `${hrs} hrs. & ${mins} min.`;
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const filtered = attendance.filter(record => {
    const matchesDate = !searchDate || record.date === searchDate;
    const matchesName = !searchEmployee || (record.username && record.username.toLowerCase().includes(searchEmployee.toLowerCase()));
    return matchesDate && matchesName;
  });

  const handleDownload = () => {
    alert('Feature coming soon: Generating PDF/CSV report...');
  };

  // Role Based Style Config
  const getStyle = () => {
    if (user?.role === 'hr') return {
      main: '#667eea',
      header: 'linear-gradient(135deg, #4c51bf 0%, #6b46c1 100%)',
      accent: '#9f7aea',
      light: '#f5f3ff',
      icon: '🏛️'
    };
    if (user?.role === 'manager') return {
      main: '#f5576c',
      header: 'linear-gradient(135deg, #f5576c 0%, #f43f5e 100%)',
      accent: '#fb7185',
      light: '#fff1f2',
      icon: '📊'
    };
    return {
      main: '#1a6b61',
      header: 'linear-gradient(135deg, #1a6b61 0%, #2d8277 100%)',
      accent: '#4db6ac',
      light: '#e0f2f1',
      icon: '⏰'
    };
  };

  const theme = getStyle();

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', background: 'white', minHeight: '100vh' }}>
      
      {/* Document Header */}
      <div className="timesheet-header" style={{ background: theme.header, color: 'white', padding: '30px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '8px 8px 0 0' }}>
        <div className="d-flex align-items-center gap-4">
          <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
            {theme.icon}
          </div>
          <div>
            <h1 className="mb-0 fw-bold" style={{ fontSize: '36px', letterSpacing: '1px' }}>{user?.role === 'hr' ? 'Admin' : (user?.role === 'manager' ? 'Team' : 'My')}</h1>
            <h2 className="mb-0 fw-light" style={{ fontSize: '32px', opacity: 0.9 }}>Timesheet Record</h2>
          </div>
        </div>
        <div className="text-end d-none d-md-block">
          <div className="fw-bold" style={{ fontSize: '20px' }}>EMP'97 Portal</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Report Date: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Accent Line */}
      <div style={{ height: '8px', background: theme.accent, width: '100%' }}></div>

      {/* Info Section */}
      <div style={{ background: theme.light, padding: '30px 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderBottom: `1px solid ${theme.accent}` }}>
        <div className="d-flex flex-wrap gap-4 align-items-center">
          <div>
            <span style={{ fontWeight: '700', fontSize: '15px', color: theme.main }}>User: </span>
            <span style={{ fontSize: '15px', color: '#333' }}>{user?.username}</span>
          </div>
          <div>
            <span style={{ fontWeight: '700', fontSize: '15px', color: theme.main }}>Role: </span>
            <span style={{ fontSize: '15px', color: '#333', textTransform: 'uppercase' }}>{user?.role}</span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <button className="btn btn-sm text-white" onClick={handleDownload} style={{ background: theme.main, border: 'none' }}>⬇️ Export Data</button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 d-flex flex-wrap gap-3 align-items-center" style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Date:</span>
          <input type="date" className="form-control form-control-sm" value={searchDate} onChange={e => setSearchDate(e.target.value)} style={{ width: '150px' }} />
        </div>
        {(user?.role === 'hr' || user?.role === 'manager') && (
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Staff Name:</span>
            <input type="text" className="form-control form-control-sm" placeholder="Search..." value={searchEmployee} onChange={e => setSearchEmployee(e.target.value)} style={{ width: '180px' }} />
          </div>
        )}
        <button className="btn btn-sm btn-link text-decoration-none" onClick={() => { setSearchDate(''); setSearchEmployee(''); }} style={{ color: theme.main }}>Reset</button>
        <div className="ms-auto text-muted" style={{ fontSize: '13px' }}>Records: {filtered.length}</div>
      </div>

      {/* Table */}
      <div className="p-0">
        <div className="table-responsive">
          <table className="table table-bordered mb-0" style={{ borderCollapse: 'collapse', width: '100%', border: `2px solid ${theme.main}` }}>
            <thead>
              <tr style={{ background: theme.main, color: 'white' }}>
                <th className="timesheet-day-col" style={{ width: '140px', border: 'none', textAlign: 'center' }}>Day</th>
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Date</th>
                {(user?.role === 'hr' || user?.role === 'manager') && <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Staff</th>}
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>In</th>
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Out</th>
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Duration</th>
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border" style={{ color: theme.main }} role="status"></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-5 text-muted">No records match filters.</td></tr>
              ) : filtered.map((record, idx) => {
                const hours = calculateHours(record.checkIn, record.checkOut);
                return (
                  <tr key={record.id || idx}>
                    <td className="timesheet-day-col" style={{ background: theme.main, color: 'white', fontWeight: '700', padding: '15px', textAlign: 'center', fontSize: '13px', textTransform: 'uppercase' }}>
                      {getDayName(record.date).substring(0, 3)}
                    </td>
                    <td className="text-center py-3" style={{ fontSize: '14px' }}>{record.date}</td>
                    {(user?.role === 'hr' || user?.role === 'manager') && <td className="text-center py-3 fw-bold" style={{ fontSize: '14px', color: theme.main }}>{record.username}</td>}
                    <td className="text-center py-3" style={{ fontSize: '14px', background: theme.light + '40' }}>{record.checkIn || '—'}</td>
                    <td className="text-center py-3" style={{ fontSize: '14px', background: theme.light + '40' }}>{record.checkOut || '—'}</td>
                    <td className="text-center py-3" style={{ fontSize: '14px', fontWeight: '700', color: theme.main }}>{formatHrs(hours)}</td>
                    <td className="text-center py-3">
                      {record.checkOut ? 
                        <span className="badge" style={{ background: '#d1fae5', color: '#065f46' }}>Success</span> : 
                        <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Active</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 p-4 text-center">
        <button className="btn btn-link text-decoration-none fw-bold" style={{ color: theme.main }} onClick={() => navigate('/dashboard')}>
          ← Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Timesheet;
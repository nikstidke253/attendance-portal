import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Timesheet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAttendance(); }, []);

  const [searchEmployee, setSearchEmployee] = useState('');

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

  const tealColor = '#1a6b61';
  const lightTeal = '#e0f2f1';

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', background: 'white', minHeight: '100vh' }}>
      
      {/* Document Header */}
      <div className="timesheet-header" style={{ background: tealColor, color: 'white', padding: '30px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '4px 4px 0 0' }}>
        <div className="d-flex align-items-center gap-4">
          <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
            ⏰
          </div>
          <div>
            <h1 className="mb-0 fw-bold" style={{ fontSize: '36px', letterSpacing: '1px' }}>Employee</h1>
            <h2 className="mb-0 fw-light" style={{ fontSize: '32px', opacity: 0.9 }}>Weekly Timesheet</h2>
          </div>
        </div>
        <div className="text-end">
          <div className="fw-bold" style={{ fontSize: '20px' }}>EMP'97 Company</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>www.attendanceportal.com</div>
        </div>
      </div>

      {/* Red Accent Line */}
      <div style={{ height: '8px', background: '#e11d48', width: '100%' }}></div>

      {/* Employee Info Section */}
      <div style={{ background: lightTeal, padding: '30px 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #b2dfdb' }}>
        <div className="d-flex flex-wrap gap-4 align-items-center">
          <div>
            <span style={{ fontWeight: '700', fontSize: '15px', color: tealColor }}>Employee Name: </span>
            <span style={{ fontSize: '15px', color: '#333' }}>{user?.username}</span>
          </div>
          <div>
            <span style={{ fontWeight: '700', fontSize: '15px', color: tealColor }}>Department: </span>
            <span style={{ fontSize: '15px', color: '#333' }}>Engineering</span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <button className="btn btn-sm btn-success" onClick={handleDownload} style={{ background: tealColor, border: 'none' }}>⬇️ Download</button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 d-flex flex-wrap gap-3 align-items-center" style={{ background: '#f8fdfd' }}>
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Filter Date:</span>
          <input type="date" className="form-control form-control-sm" value={searchDate} onChange={e => setSearchDate(e.target.value)} style={{ width: '150px' }} />
        </div>
        {(user?.role === 'hr' || user?.role === 'manager') && (
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Search Employee:</span>
            <input type="text" className="form-control form-control-sm" placeholder="Name..." value={searchEmployee} onChange={e => setSearchEmployee(e.target.value)} style={{ width: '180px' }} />
          </div>
        )}
        <button className="btn btn-sm btn-link text-decoration-none" onClick={() => { setSearchDate(''); setSearchEmployee(''); }} style={{ color: tealColor }}>Clear Filters</button>
        <div className="ms-auto text-muted" style={{ fontSize: '13px' }}>Found {filtered.length} records</div>
      </div>

      {/* Timesheet Table */}
      <div className="p-0 mt-0">
        <div className="table-responsive">
          <table className="table table-bordered mb-0" style={{ borderCollapse: 'collapse', width: '100%', border: `2px solid ${tealColor}` }}>
            <thead>
              <tr style={{ background: tealColor, color: 'white' }}>
                <th style={{ width: '140px', border: 'none', textAlign: 'center' }}>Day</th>
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Date</th>
                {(user?.role === 'hr' || user?.role === 'manager') && <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Employee</th>}
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Time In</th>
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Time Out</th>
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Total Hours</th>
                <th className="py-3 text-center" style={{ fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-teal" role="status"></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-5 text-muted">No attendance records found.</td></tr>
              ) : filtered.map((record, idx) => {
                const hours = calculateHours(record.checkIn, record.checkOut);
                return (
                  <tr key={record.id || idx}>
                    <td className="timesheet-day-col" style={{ background: tealColor, color: 'white', fontWeight: '700', padding: '15px', textAlign: 'center', fontSize: '13px', textTransform: 'uppercase' }}>
                      {getDayName(record.date).substring(0, 3)}
                    </td>
                    <td className="text-center py-3" style={{ fontSize: '14px' }}>{record.date}</td>
                    {(user?.role === 'hr' || user?.role === 'manager') && <td className="text-center py-3 fw-bold" style={{ fontSize: '14px', color: tealColor }}>{record.username}</td>}
                    <td className="text-center py-3" style={{ fontSize: '14px', background: '#f8fdfd' }}>{record.checkIn || '—'}</td>
                    <td className="text-center py-3" style={{ fontSize: '14px', background: '#f8fdfd' }}>{record.checkOut || '—'}</td>
                    <td className="text-center py-3" style={{ fontSize: '14px', fontWeight: '700', color: tealColor }}>{formatHrs(hours)}</td>
                    <td className="text-center py-3">
                      {record.checkOut ? 
                        <span className="badge bg-success-soft" style={{ background: '#e8f5e9', color: '#2e7d32' }}>Completed</span> : 
                        <span className="badge bg-warning-soft" style={{ background: '#fff3e0', color: '#ef6c00' }}>Active</span>
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
        <button className="btn btn-outline-secondary px-5" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
      
      <style>{`
        .text-teal { color: #1a6b61 !important; }
        table th, table td { vertical-align: middle !important; }
      `}</style>
    </div>
  );
};

export default Timesheet;
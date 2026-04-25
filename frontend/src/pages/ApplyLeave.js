import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { showToast } from '../components/Toast';

const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaveTypes();
    fetchMyLeaves();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/leave-types');
      setLeaveTypes(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setMyLeaves(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason) {
      showToast('Please fill all fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      await api.post('/leaves/apply', {
        ...form,
        leaveTypeId: parseInt(form.leaveTypeId, 10)
      });
      showToast('Leave request submitted successfully!', 'success');
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit request', 'error');
    }
    setLoading(false);
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const getTheme = () => {
    if (user?.role === 'hr') return { main: '#667eea', grad: 'linear-gradient(135deg, #667eea, #764ba2)', light: '#f5f3ff', btn: '#667eea' };
    if (user?.role === 'manager') return { main: '#f5576c', grad: 'linear-gradient(135deg, #f5576c, #f43f5e)', light: '#fff1f2', btn: '#f5576c' };
    return { main: '#4facfe', grad: 'linear-gradient(135deg, #4facfe, #00f2fe)', light: '#f0f9ff', btn: '#4facfe' };
  };

  const theme = getTheme();

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div className="card border-0 mb-4 overflow-hidden shadow-sm" style={{ borderRadius: '24px', background: theme.grad, color: 'white' }}>
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">📝 Apply for Leave</h2>
              <p className="mb-0 opacity-75">Submit and track your time-off requests</p>
            </div>
            <button className="btn btn-light btn-sm fw-bold px-3" onClick={() => navigate('/dashboard')} style={{ color: theme.main, borderRadius: '12px' }}>Dashboard</button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Form Section */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
            <h5 className="fw-bold mb-4" style={{ color: theme.main }}>New Request</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold text-muted small">LEAVE TYPE</label>
                <select className="form-select border-0 bg-light p-3" style={{ borderRadius: '12px' }} value={form.leaveTypeId} onChange={e => setForm({...form, leaveTypeId: e.target.value})}>
                  <option value="">Select Type...</option>
                  {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.days} Days)</option>)}
                </select>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small">START DATE</label>
                  <input type="date" className="form-control border-0 bg-light p-3" style={{ borderRadius: '12px' }} value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted small">END DATE</label>
                  <input type="date" className="form-control border-0 bg-light p-3" style={{ borderRadius: '12px' }} value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>
              {form.startDate && form.endDate && (
                <div className="p-3 mb-3 text-center fw-bold" style={{ background: theme.light, color: theme.main, borderRadius: '12px' }}>
                  Total Duration: {calculateDays(form.startDate, form.endDate)} Days
                </div>
              )}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">REASON</label>
                <textarea className="form-control border-0 bg-light p-3" style={{ borderRadius: '12px' }} rows="3" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Why are you taking leave?"></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100 p-3 fw-bold" disabled={loading} style={{ background: theme.main, border: 'none', borderRadius: '12px', boxShadow: `0 10px 20px ${theme.main}33` }}>
                {loading ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
            <h5 className="fw-bold mb-4" style={{ color: theme.main }}>Recent History</h5>
            {myLeaves.length === 0 ? (
              <div className="text-center py-5 text-muted">No requests found</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {myLeaves.slice(0, 6).map(l => (
                  <div key={l.id} className="p-3 border-0 d-flex justify-content-between align-items-center" style={{ background: '#f8fafc', borderRadius: '16px' }}>
                    <div>
                      <div className="fw-bold small text-dark">{l.type}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>{l.startDate} - {l.endDate}</div>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${l.status === 'Approved' ? 'bg-success' : (l.status === 'Rejected' ? 'bg-danger' : 'bg-warning')} text-white`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-link mt-auto pt-4 text-decoration-none fw-bold" style={{ color: theme.main }}>View Full History →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
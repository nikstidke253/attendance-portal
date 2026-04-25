import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { showToast } from '../components/Toast';

const statusConfig = {
  Approved: { bg: '#d1fae5', color: '#065f46', dot: '#10b981', icon: '✅' },
  Rejected: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', icon: '❌' },
  Pending:  { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', icon: '⏳' }
};

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    fetchLeaveTypes();
    fetchMyLeaves();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/leave-types');
      setLeaveTypes(res.data);
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  };

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setMyLeaves(res.data);
    } catch (err) {
      console.error('Error fetching my leaves:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason) {
      showToast('Please fill all required fields', 'warning');
      return;
    }
    if (form.endDate < form.startDate) {
      showToast('End date cannot be before start date', 'warning');
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
      showToast(err.response?.data?.error || 'Failed to submit leave request', 'error');
    }
    setLoading(false);
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const pending  = myLeaves.filter(l => l.status === 'Pending').length;
  const approved = myLeaves.filter(l => l.status === 'Approved').length;
  const rejected = myLeaves.filter(l => l.status === 'Rejected').length;

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 8px' }}>
      {/* Header */}
      <div className="page-header-gradient mb-4" style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'white' }}>📝 Apply for Leave</h2>
            <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px', color: 'white' }}>Submit and track your leave requests</p>
          </div>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>← Back</button>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Requests', value: myLeaves.length, icon: '📋', color: '#667eea', bg: '#ede9fe' },
          { label: 'Pending',        value: pending,         icon: '⏳', color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Approved',       value: approved,        icon: '✅', color: '#10b981', bg: '#d1fae5' },
          { label: 'Rejected',       value: rejected,        icon: '❌', color: '#ef4444', bg: '#fee2e2' }
        ].map((s, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Application Form */}
        <div className="col-lg-5">
          <div className="card border-0 h-100" style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(79,172,254,0.15)' }}>
            <div style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)', padding: '20px 24px', color: 'white' }}>
              <h4 className="mb-1 fw-bold">➕ New Leave Request</h4>
              <p className="mb-0" style={{ opacity: 0.85, fontSize: '13px' }}>Fill in your leave details below</p>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Leave Type *</label>
                  <select
                    className="form-select"
                    value={form.leaveTypeId}
                    onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                    required
                  >
                    <option value="">— Select Leave Type —</option>
                    {leaveTypes.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.annualQuota} days/year)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">End Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.endDate}
                      min={form.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {form.startDate && form.endDate && (
                  <div className="mb-3 p-3" style={{ background: '#f0f8ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                    <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: '600' }}>
                      📅 Duration: <strong>{calculateDays(form.startDate, form.endDate)} day{calculateDays(form.startDate, form.endDate) !== 1 ? 's' : ''}</strong>
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label">Reason *</label>
                  <textarea
                    className="form-control"
                    placeholder="Briefly describe the reason for your leave..."
                    rows="4"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    required
                    style={{ resize: 'none' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-3" disabled={loading}
                  style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px' }}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Submitting...</>
                  ) : (
                    '🚀 Submit Leave Request'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Leave History */}
        <div className="col-lg-7">
          <div className="card border-0" style={{ borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <div className="card-header py-3 px-4 d-flex align-items-center justify-content-between" style={{ background: 'white', borderBottom: '1px solid #f1f5f9' }}>
              <h5 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>📜 My Leave History</h5>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{myLeaves.length} request{myLeaves.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {myLeaves.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📭</div>
                  <p className="text-muted" style={{ fontSize: '14px' }}>No leave requests yet. Apply for your first leave!</p>
                </div>
              ) : (
                myLeaves.map(l => {
                  const sc = statusConfig[l.status] || statusConfig.Pending;
                  const days = calculateDays(l.startDate, l.endDate);
                  return (
                    <div key={l.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="d-flex align-items-start justify-content-between gap-3">
                        <div className="d-flex align-items-start gap-3">
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                            {sc.icon}
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: '14px', color: '#1e293b' }}>{l.type}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                              {l.startDate} → {l.endDate}
                              <span style={{ marginLeft: '8px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '8px', color: '#64748b', fontWeight: '600', fontSize: '11px' }}>
                                {days} day{days !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {l.reason && (
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>"{l.reason}"</div>
                            )}
                          </div>
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', background: sc.bg, color: sc.color, fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.dot, display: 'inline-block' }}></span>
                          {l.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
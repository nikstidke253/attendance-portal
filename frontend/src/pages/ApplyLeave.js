import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/leaves/apply', form);
      alert('✅ Leave request submitted successfully!');
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit leave request');
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return <span className="badge bg-success-soft"><i className="fas fa-check-circle me-1"></i>Approved</span>;
    if (status === 'Rejected') return <span className="badge bg-danger-soft"><i className="fas fa-times-circle me-1"></i>Rejected</span>;
    return <span className="badge bg-warning-soft"><i className="fas fa-clock me-1"></i>Pending</span>;
  };
  
  return (
    <div className="container py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark">
          <i className="fas fa-file-alt text-primary me-2"></i>
          Apply for Leave
        </h2>
        <button className="btn btn-outline-secondary shadow-sm" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left me-2"></i>Back
        </button>
      </div>

      <div className="row g-4">
        {/* Apply Form */}
        <div className="col-lg-5">
          <div className="card glass-card border-0 h-100">
            <div className="card-body p-4">
              <h4 className="fw-bold text-primary mb-4">
                <i className="fas fa-plus-circle me-2"></i>New Request
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">Leave Type *</label>
                  <select
                    className="form-select"
                    value={form.leaveTypeId}
                    onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.annualQuota} days/year)</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted">Reason *</label>
                  <textarea
                    className="form-control"
                    placeholder="Briefly describe the reason for your leave..."
                    rows="3"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Submitting...</>
                  ) : (
                    <><i className="fas fa-paper-plane me-2"></i>Submit Request</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Leave History */}
        <div className="col-lg-7">
          <div className="card glass-card border-0">
            <div className="card-body p-0">
              <div className="p-4 pb-0">
                <h4 className="fw-bold text-dark">
                  <i className="fas fa-history me-2 text-primary"></i>My Leave History
                </h4>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          <i className="fas fa-calendar-times d-block fs-2 mb-2 opacity-25"></i>
                          No leave requests yet.
                        </td>
                      </tr>
                    ) : myLeaves.map(l => (
                      <tr key={l.id}>
                        <td>
                          <span className="fw-bold text-dark">{l.type}</span>
                          <div className="text-muted small">{l.reason}</div>
                        </td>
                        <td>
                          <span className="text-muted">{l.startDate}</span>
                          <span className="text-muted mx-1">→</span>
                          <span className="text-muted">{l.endDate}</span>
                        </td>
                        <td>{getStatusBadge(l.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
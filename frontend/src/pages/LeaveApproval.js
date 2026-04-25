import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { showToast } from '../components/Toast';

const LeaveApproval = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const res = await api.get('/leaves');
      setLeaveRequests(res.data || []);
    } catch (err) {
      showToast('Failed to load leave requests', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      showToast(`Request ${status} successfully!`, 'success');
      fetchLeaveRequests();
    } catch (err) {
      showToast('Operation failed', 'error');
      console.error(err);
    }
  };

  const getTheme = () => {
    if (user?.role === 'hr') return { main: '#667eea', grad: 'linear-gradient(135deg, #667eea, #764ba2)', light: '#f5f3ff', accent: '#7c3aed' };
    return { main: '#f5576c', grad: 'linear-gradient(135deg, #f5576c, #f43f5e)', light: '#fff1f2', accent: '#f43f5e' };
  };

  const theme = getTheme();
  const pending = leaveRequests.filter(r => r.status === 'Pending');
  const processed = leaveRequests.filter(r => r.status !== 'Pending');

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div className="card border-0 mb-4 overflow-hidden shadow-sm" style={{ borderRadius: '24px', background: theme.grad, color: 'white' }}>
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">⚖️ Leave Approvals</h2>
              <p className="mb-0 opacity-75">Review and manage employee time-off requests</p>
            </div>
            <button className="btn btn-light btn-sm fw-bold px-3" onClick={() => navigate('/dashboard')} style={{ color: theme.main, borderRadius: '12px' }}>← Back</button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Pending Requests */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: theme.main }}>Pending Requests ({pending.length})</h5>
            </div>
            
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
            ) : pending.length === 0 ? (
              <div className="text-center py-5 text-muted bg-light" style={{ borderRadius: '16px' }}>
                🌟 No pending requests to review!
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr className="text-muted small">
                      <th>EMPLOYEE</th><th>TYPE</th><th>DATES</th><th>REASON</th><th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(r => (
                      <tr key={r.id}>
                        <td><div className="fw-bold text-dark">{r.username}</div></td>
                        <td><span className="badge bg-light text-dark border">{r.type}</span></td>
                        <td><div className="small fw-bold">{r.startDate}</div><div className="small text-muted">{r.endDate}</div></td>
                        <td><div className="small text-muted" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reason}</div></td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-success px-3" onClick={() => handleAction(r.id, 'Approved')} style={{ borderRadius: '8px' }}>Approve</button>
                            <button className="btn btn-sm btn-outline-danger px-3" onClick={() => handleAction(r.id, 'Rejected')} style={{ borderRadius: '8px' }}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Processed History */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
            <h5 className="fw-bold mb-4" style={{ color: theme.main }}>Recent Actions</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small">
                    <th>EMPLOYEE</th><th>TYPE</th><th>STATUS</th><th>DATES</th>
                  </tr>
                </thead>
                <tbody>
                  {processed.slice(0, 10).map(r => (
                    <tr key={r.id}>
                      <td className="fw-bold">{r.username}</td>
                      <td>{r.type}</td>
                      <td>
                        <span className={`badge px-3 py-2 ${r.status === 'Approved' ? 'bg-success-soft' : 'bg-danger-soft'}`} style={{ background: r.status === 'Approved' ? '#d1fae5' : '#fee2e2', color: r.status === 'Approved' ? '#065f46' : '#991b1b', borderRadius: '8px' }}>
                          {r.status}
                        </span>
                      </td>
                      <td className="small text-muted">{r.startDate} to {r.endDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApproval;
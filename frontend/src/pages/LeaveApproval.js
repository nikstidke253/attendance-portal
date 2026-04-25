import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { showToast } from '../components/Toast';

const statusConfig = {
  Approved: { bg: '#d1fae5', color: '#065f46', dot: '#10b981', icon: '✅', label: 'Approved' },
  Rejected: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', icon: '❌', label: 'Rejected' },
  Pending:  { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', icon: '⏳', label: 'Pending' }
};

const LeaveApproval = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchLeaveRequests(); }, []);

  const fetchLeaveRequests = async () => {
    try {
      const res = await api.get('/leaves');
      setLeaveRequests(res.data || []);
    } catch (err) {
      showToast('Failed to load leave requests', 'error');
      console.error(err);
    }
  };

  const handleAction = async (leave, action) => {
    setActionLoading(`${leave.id}-${action}`);
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      await api.put(`/leaves/${leave.id}/status`, { status });
      showToast(
        `Leave request ${status.toLowerCase()} for ${leave.username}`,
        action === 'approve' ? 'success' : 'error'
      );
      fetchLeaveRequests();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to process request', 'error');
    }
    setActionLoading(null);
  };

  const filterTabs = ['Pending', 'Approved', 'Rejected', 'All'];
  const displayed = filter === 'All' ? leaveRequests : leaveRequests.filter(l => l.status === filter);

  const counts = {
    Pending:  leaveRequests.filter(l => l.status === 'Pending').length,
    Approved: leaveRequests.filter(l => l.status === 'Approved').length,
    Rejected: leaveRequests.filter(l => l.status === 'Rejected').length,
    All:      leaveRequests.length
  };

  const tabColors = {
    Pending:  { active: 'linear-gradient(135deg,#f59e0b,#d97706)', text: '#92400e', bg: '#fef3c7' },
    Approved: { active: 'linear-gradient(135deg,#10b981,#059669)', text: '#065f46', bg: '#d1fae5' },
    Rejected: { active: 'linear-gradient(135deg,#ef4444,#dc2626)', text: '#991b1b', bg: '#fee2e2' },
    All:      { active: 'linear-gradient(135deg,#667eea,#764ba2)', text: '#3730a3', bg: '#e0e7ff' }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 8px' }}>
      {/* Header */}
      <div className="page-header-gradient mb-4" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'white' }}>📋 Leave Approvals</h2>
            <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px', color: 'white' }}>
              Review and manage employee leave requests
            </p>
          </div>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="row g-3 mb-4">
        {[
          { key: 'Pending',  icon: '⏳', label: 'Pending',  color: '#f59e0b', bg: '#fef3c7' },
          { key: 'Approved', icon: '✅', label: 'Approved', color: '#10b981', bg: '#d1fae5' },
          { key: 'Rejected', icon: '❌', label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
          { key: 'All',      icon: '📋', label: 'Total',    color: '#667eea', bg: '#ede9fe' }
        ].map(s => (
          <div className="col-6 col-md-3" key={s.key}>
            <div onClick={() => setFilter(s.key)} style={{ background: 'white', borderRadius: '16px', padding: '18px', cursor: 'pointer', boxShadow: filter === s.key ? `0 4px 20px ${s.color}40` : '0 2px 8px rgba(0,0,0,0.06)', border: filter === s.key ? `2px solid ${s.color}` : '2px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{counts[s.key]}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {filterTabs.map(tab => {
          const tc = tabColors[tab];
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '9px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s',
                background: isActive ? tc.active : '#f8fafc',
                color: isActive ? 'white' : '#64748b',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              {tab} ({counts[tab]})
            </button>
          );
        })}
      </div>

      {/* Leave Requests Table */}
      <div className="card border-0" style={{ borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div className="card-body p-0">
          {displayed.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>📭</div>
              <h5 style={{ color: '#1e293b' }}>No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests</h5>
              <p className="text-muted" style={{ fontSize: '14px' }}>
                {filter === 'Pending' ? 'All caught up! No pending requests.' : `No ${filter.toLowerCase()} requests found.`}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '24px' }}>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th className="text-end" style={{ paddingRight: '24px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(leave => {
                    const sc = statusConfig[leave.status] || statusConfig.Pending;
                    const isOwn = leave.userId === user?.id;
                    const isPending = leave.status === 'Pending';
                    const approveKey = `${leave.id}-approve`;
                    const rejectKey = `${leave.id}-reject`;
                    return (
                      <tr key={leave.id}>
                        <td style={{ paddingLeft: '24px' }}>
                          <div className="d-flex align-items-center gap-3">
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                              {leave.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="fw-bold" style={{ fontSize: '14px', color: '#1e293b' }}>{leave.username}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Applied {new Date(leave.appliedOn).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>{leave.type}</span>
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          <div style={{ color: '#1e293b', fontWeight: '500' }}>{leave.startDate}</div>
                          <div style={{ color: '#94a3b8', fontSize: '11px' }}>→ {leave.endDate}</div>
                        </td>
                        <td style={{ fontSize: '13px', color: '#64748b', maxWidth: '160px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>{leave.reason}</div>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', background: sc.bg, color: sc.color, fontSize: '12px', fontWeight: '600' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot, display: 'inline-block' }}></span>
                            {sc.label}
                          </span>
                        </td>
                        <td className="text-end" style={{ paddingRight: '24px' }}>
                          {isPending && !isOwn ? (
                            <div className="d-flex gap-2 justify-content-end">
                              <button
                                className="btn btn-sm btn-success"
                                style={{ borderRadius: '8px', fontSize: '12px', padding: '5px 14px', fontWeight: '600', border: 'none' }}
                                onClick={() => handleAction(leave, 'approve')}
                                disabled={actionLoading === approveKey}
                              >
                                {actionLoading === approveKey ? <span className="spinner-border spinner-border-sm" role="status"></span> : '✓ Approve'}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                style={{ borderRadius: '8px', fontSize: '12px', padding: '5px 14px', fontWeight: '600', border: 'none' }}
                                onClick={() => handleAction(leave, 'reject')}
                                disabled={actionLoading === rejectKey}
                              >
                                {actionLoading === rejectKey ? <span className="spinner-border spinner-border-sm" role="status"></span> : '✕ Reject'}
                              </button>
                            </div>
                          ) : isPending && isOwn ? (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Your request</span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong>{displayed.length}</strong> {filter !== 'All' ? filter.toLowerCase() : ''} request{displayed.length !== 1 ? 's' : ''}
          </span>
          <button onClick={fetchLeaveRequests} style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveApproval;
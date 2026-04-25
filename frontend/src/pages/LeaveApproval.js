import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LeaveApproval = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewType, setViewType] = useState('pending');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchLeaveRequests();
  }, [viewType]);
  
  const fetchLeaveRequests = async () => {
    try {
      // For mock backend, we fetch all leaves or we can use the /leaves endpoint.
      // Wait, our backend /api/leaves gives all leaves for HR/Manager.
      const response = await api.get('/leaves');
      let leaves = response.data || [];
      
      if (user?.role === 'manager' && viewType === 'pending') {
        leaves = leaves.filter(l => l.status === 'Pending');
      }
      setLeaveRequests(leaves);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };
  
  const handleAction = async (action) => {
    setLoading(true);
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      await api.put(`/leaves/${selectedLeave.id}/status`, { status });
      setSelectedLeave(null);
      fetchLeaveRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process request');
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
          <i className="fas fa-clipboard-check text-primary me-2"></i>
          Leave Approvals
        </h2>
        <button className="btn btn-outline-secondary shadow-sm" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>
      
      {user?.role === 'manager' && (
        <div className="d-flex mb-4">
          <button 
            className={`btn ${viewType === 'pending' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
            onClick={() => setViewType('pending')}
          >
            Pending Requests
          </button>
          <button 
            className={`btn ${viewType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewType('all')}
          >
            All Requests
          </button>
        </div>
      )}

      {selectedLeave && (
        <div className="card glass-card slide-in border-0 mb-4">
          <div className="card-body p-4">
            <h4 className="fw-bold text-primary mb-3">Review Leave Request</h4>
            <div className="row mb-3">
              <div className="col-md-6">
                <p className="mb-1 text-muted fw-semibold">Employee</p>
                <p className="fw-bold">{selectedLeave.username}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-1 text-muted fw-semibold">Leave Type</p>
                <p className="fw-bold">{selectedLeave.type}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-1 text-muted fw-semibold">Duration</p>
                <p className="fw-bold">{selectedLeave.startDate} to {selectedLeave.endDate}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-1 text-muted fw-semibold">Reason</p>
                <p className="fw-bold">{selectedLeave.reason}</p>
              </div>
            </div>
            
            {selectedLeave.userId === user?.id && (
              <div className="alert alert-warning py-2 mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                You cannot approve or reject your own leave request.
              </div>
            )}
            
            <div className="d-flex gap-2">
              <button 
                className="btn btn-success px-4 shadow-none" 
                onClick={() => handleAction('approve')} 
                disabled={loading || selectedLeave.userId === user?.id}
              >
                <i className="fas fa-check me-2"></i>Approve
              </button>
              <button 
                className="btn btn-danger px-4 shadow-none" 
                onClick={() => handleAction('reject')} 
                disabled={loading || selectedLeave.userId === user?.id}
              >
                <i className="fas fa-times me-2"></i>Reject
              </button>
              <button 
                className="btn btn-secondary px-4 shadow-none" 
                onClick={() => setSelectedLeave(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card glass-card border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No leave requests found.
                    </td>
                  </tr>
                ) : leaveRequests.map(leave => (
                  <tr key={leave.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary-soft rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px', height:'40px'}}>
                          <i className="fas fa-user text-primary"></i>
                        </div>
                        <div className="fw-bold text-dark">{leave.username}</div>
                      </div>
                    </td>
                    <td><span className="fw-semibold text-muted">{leave.type}</span></td>
                    <td>{leave.startDate} to {leave.endDate}</td>
                    <td>{getStatusBadge(leave.status)}</td>
                    <td className="text-end">
                      {leave.status === 'Pending' && !selectedLeave ? (
                        <button 
                          className="btn btn-sm btn-outline-primary shadow-none"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-muted small">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApproval;
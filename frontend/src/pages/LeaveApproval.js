import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LeaveApproval = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('pending'); // 'pending' or 'all'
  
  useEffect(() => {
    fetchLeaveRequests();
  }, [viewType]);
  
  const fetchLeaveRequests = async () => {
    try {
      let response;
      if (user?.role === 'hr') {
        // HR can view all leave requests
        response = await axios.get('https://attendance-portal-1-u1rw.onrender.com/api/leaves/all');
      } else if (user?.role === 'manager') {
        // Manager can view pending leaves of team members
        if (viewType === 'pending') {
          response = await axios.get('https://attendance-portal-1-u1rw.onrender.com/api/leaves/pending');
        } else {
          response = await axios.get('https://attendance-portal-1-u1rw.onrender.com/api/leaves/all');
        }
      }
      setLeaveRequests(response?.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      alert(error.response?.data?.error || 'Failed to fetch leave requests');
    }
  };
  
  const handleAction = async (action) => {
    if (!remark.trim()) {
      alert('Please provide a remark');
      return;
    }
    
    setLoading(true);
    try {
      await axios.put(`https://attendance-portal-1-u1rw.onrender.com/api/leaves/${selectedLeave.id}/${action}`, { remark });
      alert(`Leave ${action}ed successfully`);
      setSelectedLeave(null);
      setRemark('');
      fetchLeaveRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process request');
    }
    setLoading(false);
  };
  
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'status-pending', text: 'Pending' },
      approved: { class: 'status-approved', text: 'Approved' },
      rejected: { class: 'status-rejected', text: 'Rejected' }
    };
    const s = statusMap[status] || statusMap.pending;
    return <span className={s.class}>{s.text}</span>;
  };
  
  // HR View - All Leave Requests
  if (user?.role === 'hr') {
    return (
      <div>
        <div className="card">
          <h3>📋 All Leave Requests</h3>
          {leaveRequests.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              No leave requests found.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actioned By</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map(leave => (
                    <tr key={leave.id}>
                      <td>{leave.User?.username} ({leave.User?.role})</td>
                      <td>{leave.LeaveType?.name}</td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
                      <td>{leave.reason}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td>{leave.Actioner?.username || '-'}</td>
                      <td>{leave.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Manager View - Pending Leave Requests
  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>✓ Pending Leave Requests</h3>
          <div>
            <button 
              className={`btn ${viewType === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewType('pending')}
              style={{ marginRight: '10px' }}
            >
              Pending
            </button>
            <button 
              className={`btn ${viewType === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewType('all')}
            >
              All Requests
            </button>
          </div>
        </div>
        
        {leaveRequests.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            {viewType === 'pending' ? 'No pending leave requests from your team members.' : 'No leave requests found.'}
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {viewType === 'pending' && <th>Action</th>}
                  {viewType === 'all' && <th>Remark</th>}
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map(leave => (
                  <tr key={leave.id}>
                    <td>{leave.User?.username}</td>
                    <td>{leave.LeaveType?.name}</td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td>{leave.reason}</td>
                    <td>{getStatusBadge(leave.status)}</td>
                    {viewType === 'pending' && leave.status === 'pending' && (
                      <td>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => setSelectedLeave(leave)}
                          style={{ padding: '6px 16px', fontSize: '12px' }}
                        >
                          Review
                        </button>
                      </td>
                    )}
                    {viewType === 'all' && (
                      <td>{leave.remark || '-'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {selectedLeave && (
        <div className="card" style={{ animation: 'fadeInUp 0.3s ease' }}>
          <h3>📋 Review Leave Request</h3>
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Employee:</strong> {selectedLeave.User?.username}</p>
            <p><strong>Leave Type:</strong> {selectedLeave.LeaveType?.name}</p>
            <p><strong>Period:</strong> {selectedLeave.startDate} to {selectedLeave.endDate}</p>
            <p><strong>Reason:</strong> {selectedLeave.reason}</p>
            {selectedLeave.userId === user?.id && (
              <p style={{ color: '#f5576c', marginTop: '10px' }}>
                ⚠️ Note: You cannot approve/reject your own leave request.
              </p>
            )}
          </div>
          
          <div className="form-group">
            <label>Remark *</label>
            <textarea
              className="form-control"
              rows="3"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter your remark (required)..."
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              className="btn btn-success" 
              onClick={() => handleAction('approve')} 
              disabled={loading || selectedLeave.userId === user?.id}
              title={selectedLeave.userId === user?.id ? "You cannot approve your own leave request" : ""}
            >
              ✓ Approve
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => handleAction('reject')} 
              disabled={loading || selectedLeave.userId === user?.id}
              title={selectedLeave.userId === user?.id ? "You cannot reject your own leave request" : ""}
            >
              ✗ Reject
            </button>
            <button 
              className="btn" 
              onClick={() => { setSelectedLeave(null); setRemark(''); }}
              style={{ background: '#6c757d', color: 'white' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;
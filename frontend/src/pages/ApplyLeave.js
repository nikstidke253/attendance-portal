import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApplyLeave = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  
  useEffect(() => {
    fetchLeaveTypes();
    fetchMyLeaves();
  }, []);
  
  const fetchLeaveTypes = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/leave-types`);
    setLeaveTypes(res.data);
  };
  
  const fetchMyLeaves = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/leaves/my`);
    setMyLeaves(res.data);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/leaves/apply`, form);
      alert('Leave request submitted');
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err) {
      alert('Failed to submit');
    }
  };
  
  return (
    <div>
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3>Apply for Leave</h3>
        <form onSubmit={handleSubmit}>
          <select
            style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ddd' }}
            value={form.leaveTypeId}
            onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
            required
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input
            type="date"
            style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ddd' }}
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
          <input
            type="date"
            style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ddd' }}
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
          />
          <textarea
            placeholder="Reason"
            style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ddd' }}
            rows="3"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Submit</button>
        </form>
      </div>
      
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
        <h3>My Leave History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Start</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>End</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {myLeaves.map(l => (
              <tr key={l.id}>
                <td style={{ padding: '10px' }}>{l.LeaveType?.name}</td>
                <td style={{ padding: '10px' }}>{l.startDate}</td>
                <td style={{ padding: '10px' }}>{l.endDate}</td>
                <td style={{ padding: '10px' }}><span style={{ color: l.status === 'pending' ? 'orange' : l.status === 'approved' ? 'green' : 'red' }}>{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplyLeave;
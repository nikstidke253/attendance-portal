import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveConfiguration = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    annualQuota: ''
  });
  
  useEffect(() => {
    fetchLeaveTypes();
  }, []);
  
  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get('https://attendance-portal-1-u1rw.onrender.com/api/leave-types');
      setLeaveTypes(response.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      alert('Failed to fetch leave types');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.annualQuota) {
      alert('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      if (editing) {
        await axios.put(`https://attendance-portal-1-u1rw.onrender.com/api/leave-types/${editing.id}`, formData);
        alert('Leave type updated successfully');
      } else {
        await axios.post('https://attendance-portal-1-u1rw.onrender.com/api/leave-types', formData);
        alert('Leave type created successfully');
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', annualQuota: '' });
      fetchLeaveTypes();
    } catch (error) {
      alert(error.response?.data?.error || 'Operation failed');
    }
    setLoading(false);
  };
  
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axios.delete(`https://attendance-portal-1-u1rw.onrender.com/api/leave-types/${id}`);
        alert('Leave type deleted successfully');
        fetchLeaveTypes();
      } catch (error) {
        alert(error.response?.data?.error || 'Deletion failed');
      }
    }
  };
  
  const handleEdit = (type) => {
    setEditing(type);
    setFormData({ name: type.name, annualQuota: type.annualQuota });
    setShowForm(true);
  };
  
  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Leave Configuration</h3>
          <button className="btn btn-primary" onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setFormData({ name: '', annualQuota: '' });
          }}>
            {showForm ? 'Cancel' : '+ Add Leave Type'}
          </button>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '15px' }}>{editing ? 'Edit Leave Type' : 'Create Leave Type'}</h4>
            <div className="form-group">
              <label>Leave Type Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Annual Quota (days)</label>
              <input
                type="number"
                className="form-control"
                value={formData.annualQuota}
                onChange={(e) => setFormData({ ...formData, annualQuota: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editing ? 'Update' : 'Create')}
            </button>
          </form>
        )}
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Annual Quota</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map(type => (
                <tr key={type.id}>
                  <td>{type.name}</td>
                  <td>{type.annualQuota} days</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(type)}
                      style={{ marginRight: '10px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(type.id, type.name)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveConfiguration;
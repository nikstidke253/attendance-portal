import React, { useState, useEffect } from 'react';
import api from '../api';

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
      const response = await api.get('/leave-types');
      setLeaveTypes(response.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
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
        await api.put(`/leave-types/${editing.id}`, formData);
      } else {
        await api.post('/leave-types', formData);
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
        await api.delete(`/leave-types/${id}`);
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
    <div className="container py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark"><i className="fas fa-cogs text-primary me-2"></i>Leave Configuration</h2>
        <button 
          className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'} shadow-sm`}
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditing(null);
              setFormData({ name: '', annualQuota: '' });
            }
          }}
        >
          {showForm ? <><i className="fas fa-times me-2"></i>Cancel</> : <><i className="fas fa-plus me-2"></i>Add Leave Type</>}
        </button>
      </div>
      
      {showForm && (
        <div className="card glass-card slide-in mb-4 border-0">
          <div className="card-body p-4">
            <h4 className="card-title fw-bold text-primary mb-4">
              {editing ? 'Edit Leave Type' : 'Create New Leave Type'}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted">Leave Type Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Maternity Leave"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted">Annual Quota (days) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 15"
                    min="0"
                    max="365"
                    value={formData.annualQuota}
                    onChange={(e) => setFormData({ ...formData, annualQuota: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mt-4 text-end">
                <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                  {loading ? 'Saving...' : (editing ? 'Update Leave Type' : 'Create Leave Type')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="card glass-card border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Annual Quota</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">No leave types configured.</td>
                  </tr>
                ) : leaveTypes.map(type => (
                  <tr key={type.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-warning-soft rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px', height:'40px'}}>
                          <i className="fas fa-calendar-alt text-warning" style={{color: '#92400e'}}></i>
                        </div>
                        <div className="fw-bold text-dark">{type.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary-soft text-dark px-3 py-2 fs-6">
                        {type.annualQuota} Days
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2 shadow-none"
                        onClick={() => handleEdit(type)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger shadow-none"
                        onClick={() => handleDelete(type.id, type.name)}
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
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

export default LeaveConfiguration;
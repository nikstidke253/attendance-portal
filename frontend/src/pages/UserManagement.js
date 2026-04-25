import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee'
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || (!editingId && !formData.password)) {
      alert('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, {
          role: formData.role,
          email: formData.email
        });
        alert('User updated successfully');
      } else {
        await api.post('/users', formData);
        alert('User created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ username: '', email: '', password: '', role: 'employee' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Operation failed');
    }
    setLoading(false);
  };
  
  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${action} ${user.username}?`)) {
      try {
        await api.put(`/users/${user.id}`, { isActive: newStatus });
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to update user');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Do not prefill password
      role: user.role
    });
    setShowForm(true);
  };
  
  return (
    <div className="container py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark"><i className="fas fa-users text-primary me-2"></i>User Management</h2>
        <button 
          className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'} shadow-sm`} 
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditingId(null);
              setFormData({ username: '', email: '', password: '', role: 'employee' });
            }
          }}
        >
          {showForm ? <><i className="fas fa-times me-2"></i>Cancel</> : <><i className="fas fa-plus me-2"></i>Add New User</>}
        </button>
      </div>
      
      {showForm && (
        <div className="card glass-card slide-in mb-4 border-0">
          <div className="card-body p-4">
            <h4 className="card-title fw-bold text-primary mb-4">
              {editingId ? 'Edit User details' : 'Create New User'}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted">Username *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. john_doe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!!editingId}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {!editingId && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingId}
                    />
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted">Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Administrator</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 text-end">
                <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                  {loading ? 'Processing...' : (editingId ? 'Save Changes' : 'Create User')}
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
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">No users found. Add some users to get started.</td>
                  </tr>
                ) : users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary-soft rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px', height:'40px'}}>
                          <i className="fas fa-user text-primary"></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{user.username}</div>
                          <div className="text-muted small">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary-soft text-uppercase px-3 py-2">
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isActive ? (
                        <span className="badge bg-success-soft"><i className="fas fa-check-circle me-1"></i> Active</span>
                      ) : (
                        <span className="badge bg-danger-soft"><i className="fas fa-ban me-1"></i> Inactive</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2 shadow-none"
                        onClick={() => handleEditClick(user)}
                        title="Edit User"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        className={`btn btn-sm shadow-none ${user.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? "Deactivate User" : "Activate User"}
                      >
                        {user.isActive ? <i className="fas fa-lock"></i> : <i className="fas fa-unlock"></i>} {user.isActive ? 'Suspend' : 'Activate'}
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

export default UserManagement;
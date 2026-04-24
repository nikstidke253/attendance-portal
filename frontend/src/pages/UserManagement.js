import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee',
    managerId: ''
  });
  
  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://attendance-portal-1-u1rw.onrender.com/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    }
  };
  
  const fetchManagers = async () => {
    try {
      const response = await axios.get('https://attendance-portal-1-u1rw.onrender.com/api/users/managers');
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('https://attendance-portal-1-u1rw.onrender.com/api/users', formData);
      alert('User created successfully');
      setShowForm(false);
      setFormData({ username: '', email: '', password: '', role: 'employee', managerId: '' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create user');
    }
    setLoading(false);
  };
  
  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${action} ${user.username}?`)) {
      try {
        await axios.put(`https://attendance-portal-1-u1rw.onrender.com/api/users/${user.id}`, {
          role: user.role,
          managerId: user.managerId,
          isActive: newStatus
        });
        alert(`User ${action}d successfully`);
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to update user');
      }
    }
  };
  
  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>User Management</h3>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New User'}
          </button>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '15px' }}>Create New User</h4>
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                className="form-control"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            {formData.role === 'employee' && (
              <div className="form-group">
                <label>Reporting Manager</label>
                <select
                  className="form-control"
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                >
                  <option value="">Select Manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.username}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        )}
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td><span style={{ textTransform: 'uppercase' }}>{user.role}</span></td>
                  <td>{user.Manager?.username || '-'}</td>
                  <td>
                    <span style={{ color: user.isActive ? 'green' : 'red' }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={user.isActive ? 'btn btn-danger' : 'btn btn-success'}
                      onClick={() => handleToggleStatus(user)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
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

export default UserManagement;
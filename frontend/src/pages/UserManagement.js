import React, { useState, useEffect } from 'react';
import api from '../api';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'employee' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      showToast('Failed to fetch users', 'error');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        showToast('User updated successfully', 'success');
      } else {
        await api.post('/users', form);
        showToast('User created successfully', 'success');
      }
      setForm({ username: '', email: '', password: '', role: 'employee' });
      setEditingId(null);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleEdit = (user) => {
    setForm({ username: user.username, email: user.email, role: user.role, password: '' });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        showToast('User deleted successfully', 'success');
        fetchUsers();
      } catch (err) {
        showToast('Failed to delete user', 'error');
      }
    }
  };

  const themeColor = '#667eea';

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div className="card border-0 mb-4 overflow-hidden shadow-sm" style={{ borderRadius: '24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">👥 User Management</h2>
              <p className="mb-0 opacity-75">Manage organization staff and access levels</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-light btn-sm fw-bold px-3" onClick={() => navigate('/dashboard')} style={{ color: themeColor, borderRadius: '12px' }}>Dashboard</button>
              <button className="btn btn-success btn-sm fw-bold px-3" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({username:'', email:'', password:'', role:'employee'}); }} style={{ borderRadius: '12px' }}>
                {showForm ? 'Close Form' : '+ Add User'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {showForm && (
          <div className="col-12 slide-in">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
              <h5 className="fw-bold mb-4" style={{ color: themeColor }}>{editingId ? 'Edit User' : 'Create New User'}</h5>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">USERNAME</label>
                    <input type="text" className="form-control border-0 bg-light p-3" style={{ borderRadius: '12px' }} value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">EMAIL</label>
                    <input type="email" className="form-control border-0 bg-light p-3" style={{ borderRadius: '12px' }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                  {!editingId && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">PASSWORD</label>
                      <input type="password" className="form-control border-0 bg-light p-3" style={{ borderRadius: '12px' }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">ROLE</label>
                    <select className="form-select border-0 bg-light p-3" style={{ borderRadius: '12px' }} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="hr">HR</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 d-flex gap-2">
                  <button type="submit" className="btn btn-primary px-5 py-3 fw-bold" style={{ background: themeColor, border: 'none', borderRadius: '12px' }}>
                    {editingId ? 'Update User' : 'Create User'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary px-5 py-3 fw-bold" onClick={() => setShowForm(false)} style={{ borderRadius: '12px' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="col-12">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
            <h5 className="fw-bold mb-4" style={{ color: themeColor }}>User List ({users.length})</h5>
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead>
                    <tr className="text-muted small">
                      <th>USER</th><th>EMAIL</th><th>ROLE</th><th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><div className="fw-bold text-dark">{u.username}</div></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge px-3 py-2 ${u.role === 'hr' ? 'bg-primary' : (u.role === 'manager' ? 'bg-info' : 'bg-secondary')} text-white`} style={{ borderRadius: '8px' }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(u)} style={{ borderRadius: '8px' }}>Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)} style={{ borderRadius: '8px' }}>Delete</button>
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
      </div>
    </div>
  );
};

export default UserManagement;
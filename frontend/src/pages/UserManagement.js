import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { showToast } from '../components/Toast';

const roleConfig = {
  hr:       { label: 'HR Admin',  icon: '👑', cls: 'role-hr',       bg: 'linear-gradient(135deg,#667eea,#764ba2)', avatar: '#764ba2' },
  manager:  { label: 'Manager',   icon: '📊', cls: 'role-manager',   bg: 'linear-gradient(135deg,#f093fb,#f5576c)', avatar: '#f5576c' },
  employee: { label: 'Employee',  icon: '👤', cls: 'role-employee',  bg: 'linear-gradient(135deg,#4facfe,#00f2fe)', avatar: '#4facfe' }
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'employee' });

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const fetchUsers = async () => {
    setPageLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || (!editingId && !formData.password)) {
      showToast('Please fill all required fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, { role: formData.role, email: formData.email });
        showToast('User updated successfully!', 'success');
      } else {
        await api.post('/users', formData);
        showToast('User created successfully!', 'success');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ username: '', email: '', password: '', role: 'employee' });
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    }
    setLoading(false);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.username}?`)) return;
    try {
      await api.put(`/users/${user.id}`, { isActive: newStatus });
      showToast(`User ${action}d successfully`, 'success');
      fetchUsers();
    } catch {
      showToast('Failed to update user status', 'error');
    }
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  };

  return (
    <div className="container-fluid py-4 fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
            <span style={{ marginRight: '10px' }}>👥</span>User Management
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Manage employee accounts and permissions</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <button
            className="btn btn-primary shadow-sm"
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) { setEditingId(null); setFormData({ username: '', email: '', password: '', role: 'employee' }); }
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add New User'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users',   value: stats.total,    icon: '👥', color: '#667eea', bg: '#ede9fe' },
          { label: 'Active Users',  value: stats.active,   icon: '✅', color: '#10b981', bg: '#d1fae5' },
          { label: 'Inactive',      value: stats.inactive, icon: '🔒', color: '#ef4444', bg: '#fee2e2' }
        ].map((s, i) => (
          <div className="col-md-4 col-sm-12" key={i}>
            <div className="card border-0 h-100" style={{ borderRadius: '16px', background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="card-body d-flex align-items-center gap-3 p-4">
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card slide-in border-0 mb-4" style={{ borderRadius: '20px', boxShadow: '0 8px 32px rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.2) !important', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '20px 28px', color: 'white' }}>
            <h4 className="mb-1 fw-bold">{editingId ? '✏️ Edit User' : '➕ Create New User'}</h4>
            <p className="mb-0" style={{ opacity: 0.85, fontSize: '13px' }}>
              {editingId ? 'Update user role and email' : 'Fill in the details to create a new user account'}
            </p>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Username *</label>
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
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {!editingId && (
                  <div className="col-md-6">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="employee">👤 Employee</option>
                    <option value="manager">📊 Manager</option>
                    <option value="hr">👑 HR Administrator</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Processing...</>
                  ) : (
                    editingId ? '💾 Save Changes' : '🚀 Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search + Table */}
      <div className="card border-0" style={{ borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3 py-3 px-4" style={{ background: 'white', borderBottom: '1px solid #f1f5f9' }}>
          <h5 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>All Users</h5>
          <div className="search-bar" style={{ minWidth: '220px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>
        <div className="card-body p-0">
          {pageLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '40px', height: '40px' }} role="status"></div>
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '24px' }}>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-end" style={{ paddingRight: '24px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5" style={{ color: '#94a3b8' }}>
                        <div style={{ fontSize: '40px', marginBottom: '8px' }}>😕</div>
                        {search ? 'No users match your search.' : 'No users found. Add some users to get started.'}
                      </td>
                    </tr>
                  ) : filtered.map(user => {
                    const rc = roleConfig[user.role] || roleConfig.employee;
                    return (
                      <tr key={user.id} style={{ transition: 'background 0.2s' }}>
                        <td style={{ paddingLeft: '24px' }}>
                          <div className="d-flex align-items-center gap-3">
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold" style={{ color: '#1e293b', fontSize: '14px' }}>{user.username}</div>
                              <div style={{ color: '#94a3b8', fontSize: '12px' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${rc.cls}`}>
                            {rc.icon} {rc.label}
                          </span>
                        </td>
                        <td>
                          {user.isActive ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: '600' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                              Active
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: '600' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="text-end" style={{ paddingRight: '24px' }}>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            style={{ borderRadius: '8px', fontSize: '12px', padding: '5px 12px', fontWeight: '600' }}
                            onClick={() => handleEditClick(user)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className={`btn btn-sm ${user.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            style={{ borderRadius: '8px', fontSize: '12px', padding: '5px 12px', fontWeight: '600' }}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.isActive ? '🔒 Suspend' : '🔓 Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="card-footer py-3 px-4 d-flex align-items-center justify-content-between" style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing <strong>{filtered.length}</strong> of <strong>{users.length}</strong> users
            </span>
            {search && (
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSearch('')} style={{ fontSize: '12px' }}>
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
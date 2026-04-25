import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { showToast } from '../components/Toast';

const leaveColors = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

const LeaveConfiguration = () => {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', annualQuota: '' });

  useEffect(() => { fetchLeaveTypes(); }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/leave-types');
      setLeaveTypes(res.data);
    } catch {
      showToast('Failed to load leave types', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.annualQuota) {
      showToast('Please fill all required fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/leave-types/${editing.id}`, formData);
        showToast('Leave type updated!', 'success');
      } else {
        await api.post('/leave-types', formData);
        showToast('Leave type created!', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', annualQuota: '' });
      fetchLeaveTypes();
    } catch (err) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/leave-types/${id}`);
      showToast(`"${name}" deleted`, 'success');
      fetchLeaveTypes();
    } catch (err) {
      showToast(err.response?.data?.error || 'Deletion failed', 'error');
    }
  };

  const handleEdit = (type) => {
    setEditing(type);
    setFormData({ name: type.name, annualQuota: type.annualQuota });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 8px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
            <span style={{ marginRight: '10px' }}>⚙️</span>Leave Configuration
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Configure leave types and annual quotas for your organization</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>← Back</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) { setEditing(null); setFormData({ name: '', annualQuota: '' }); }
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add Leave Type'}
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      {leaveTypes.length > 0 && (
        <div className="mb-4 p-4 slide-in" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '20px', color: 'white' }}>
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <div style={{ fontSize: '48px' }}>📅</div>
            <div>
              <h4 className="mb-1 fw-bold" style={{ color: 'white' }}>
                {leaveTypes.length} Leave {leaveTypes.length === 1 ? 'Type' : 'Types'} Configured
              </h4>
              <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
                Total quota: <strong>{leaveTypes.reduce((s, t) => s + Number(t.annualQuota), 0)} days/year</strong> across all types
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card slide-in border-0 mb-4" style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(102,126,234,0.15)' }}>
          <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '20px 28px', color: 'white' }}>
            <h4 className="mb-1 fw-bold">{editing ? '✏️ Edit Leave Type' : '➕ New Leave Type'}</h4>
            <p className="mb-0" style={{ opacity: 0.85, fontSize: '13px' }}>
              {editing ? 'Update leave type details below' : 'Define a new leave category and its annual day allowance'}
            </p>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Leave Type Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Maternity Leave, Sick Leave"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Annual Quota (days) *</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 15"
                      min="1"
                      max="365"
                      value={formData.annualQuota}
                      onChange={(e) => setFormData({ ...formData, annualQuota: e.target.value })}
                      required
                    />
                    <span className="input-group-text" style={{ borderRadius: '0 12px 12px 0', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderLeft: 'none', color: '#64748b', fontSize: '13px' }}>days/year</span>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4 justify-content-end">
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</>
                  ) : (
                    editing ? '💾 Update Leave Type' : '🚀 Create Leave Type'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Type Cards Grid */}
      {leaveTypes.length === 0 && !showForm ? (
        <div className="text-center py-5" style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>📭</div>
          <h4 style={{ color: '#1e293b' }}>No Leave Types Yet</h4>
          <p className="text-muted mb-4">Click "Add Leave Type" to configure your first leave category.</p>
          <button className="btn btn-primary px-5" onClick={() => setShowForm(true)}>+ Add Leave Type</button>
        </div>
      ) : (
        <div className="row g-3">
          {leaveTypes.map((type, i) => (
            <div className="col-md-6 col-lg-4" key={type.id}>
              <div className="card border-0 h-100 fade-in" style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
              >
                <div style={{ background: leaveColors[i % leaveColors.length], padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>📅</div>
                  <h5 className="fw-bold mb-0" style={{ color: 'white', fontSize: '18px' }}>{type.name}</h5>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Annual Allowance</span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                      {type.annualQuota}
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginLeft: '4px' }}>days</span>
                    </span>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '10px', height: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ background: leaveColors[i % leaveColors.length], height: '100%', width: `${Math.min((type.annualQuota / 30) * 100, 100)}%`, borderRadius: '10px', transition: 'width 0.8s ease' }}></div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary flex-fill"
                      style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '10px' }}
                      onClick={() => handleEdit(type)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '10px' }}
                      onClick={() => handleDelete(type.id, type.name)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveConfiguration;
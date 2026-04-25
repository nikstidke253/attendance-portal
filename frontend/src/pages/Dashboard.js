import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { showToast } from '../components/Toast';

// ============================================================
// 👑 HR DASHBOARD (Purple Theme - Corporate & Data Heavy)
// ============================================================
const HRDashboard = ({ stats, user, navigate }) => {
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const res = await api.get('/users');
        setRecentUsers(res.data.slice(-5).reverse());
      } catch (err) { console.error(err); }
    };
    fetchRecentUsers();
  }, []);

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div className="page-header-gradient mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bold mb-1" style={{ color: 'white', fontSize: '32px' }}>HR Central Command 👑</h1>
            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Organization overview and workforce analytics</p>
          </div>
          <div style={{ fontSize: '64px', opacity: 0.2 }}>🏢</div>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Workforce', value: stats.totalEmployees || 0, icon: '👥', color: '#667eea', bg: '#f0f4ff' },
          { label: 'Active Today', value: stats.activeUsers || 0, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
          { label: 'Pending Approvals', value: stats.pendingLeaves || 0, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Departments', value: '8', icon: '🏛️', color: '#7c3aed', bg: '#f5f3ff' }
        ].map((kpi, i) => (
          <div className="col-md-3" key={i}>
            <div className="card border-0 h-100 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{kpi.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{kpi.label}</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: kpi.color }}>{kpi.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Leave Analytics Chart (CSS Mock) */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', height: '100%' }}>
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h5 className="fw-bold mb-0">Monthly Leave Analytics</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex align-items-end justify-content-between" style={{ height: '200px', paddingBottom: '20px', borderBottom: '2px solid #f1f5f9' }}>
                {[45, 60, 30, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} style={{ width: '40px', background: 'linear-gradient(to top, #667eea, #764ba2)', height: `${h}%`, borderRadius: '8px 8px 0 0', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#667eea' }}>{h}</div>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-between mt-2 text-muted fw-bold" style={{ fontSize: '12px' }}>
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Pie (CSS Conic Gradient) */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', height: '100%' }}>
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h5 className="fw-bold mb-0">Leave Types</h5>
            </div>
            <div className="card-body text-center p-4">
              <div style={{ 
                width: '150px', height: '150px', borderRadius: '50%', 
                background: 'conic-gradient(#667eea 0% 40%, #10b981 40% 70%, #f59e0b 70% 100%)',
                margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  Total
                </div>
              </div>
              <div className="text-start">
                <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: '13px' }}><span style={{ width: '12px', height: '12px', background: '#667eea', borderRadius: '3px' }}></span> Sick Leave (40%)</div>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: '13px' }}><span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></span> Casual Leave (30%)</div>
                <div className="d-flex align-items-center gap-2" style={{ fontSize: '13px' }}><span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '3px' }}></span> Others (30%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-transparent border-0 p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent User Registrations</h5>
              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/user-management')}>Manage All</button>
            </div>
            <div className="table-responsive px-4 pb-4">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted" style={{ fontSize: '12px' }}>
                    <th>USER</th><th>EMAIL</th><th>ROLE</th><th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id}>
                      <td><div className="fw-bold">{u.username}</div></td>
                      <td>{u.email}</td>
                      <td><span className={`badge bg-${u.role === 'hr' ? 'primary' : 'info'} text-white`}>{u.role}</span></td>
                      <td><span className="text-success fw-bold">● Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 📊 MANAGER DASHBOARD (Coral Theme - Team & Performance)
// ============================================================
const ManagerDashboard = ({ stats, user, navigate }) => {
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await api.get('/leaves');
        setPendingRequests(res.data.filter(l => l.status === 'Pending').slice(0, 4));
      } catch (err) { console.error(err); }
    };
    fetchLeaves();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      showToast(`Request ${status}`, 'success');
      setPendingRequests(prev => prev.filter(l => l.id !== id));
    } catch { showToast('Action failed', 'error'); }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* Team Header */}
      <div className="card border-0 mb-4 overflow-hidden shadow-lg" style={{ borderRadius: '24px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
        <div className="card-body p-5 text-white">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="fw-bold mb-2">Team Overview 📊</h1>
              <p className="mb-4 opacity-75">You have {pendingRequests.length} pending leave requests to review today.</p>
              <div className="d-flex gap-3">
                <button className="btn btn-light text-danger fw-bold" onClick={() => navigate('/leave-approval')}>Review All Requests</button>
                <button className="btn btn-outline-light" onClick={() => navigate('/timesheet')}>View Team Attendance</button>
              </div>
            </div>
            <div className="col-md-4 text-center d-none d-md-block">
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', border: '8px solid rgba(255,255,255,0.2)',
                borderTopColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', animation: 'spin 2s linear infinite'
              }}>
                <span className="fw-bold" style={{ fontSize: '24px' }}>94%</span>
              </div>
              <div className="mt-2 fw-bold">Team Performance</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Pending Requests - Glassmorphism */}
        <div className="col-lg-7">
          <h4 className="fw-bold mb-3" style={{ color: '#f5576c' }}>Pending Approvals</h4>
          {pendingRequests.length === 0 ? (
            <div className="glass-card p-5 text-center text-muted">
              ✅ All caught up! No pending requests.
            </div>
          ) : (
            pendingRequests.map(l => (
              <div key={l.id} className="glass-card mb-3 p-4 d-flex justify-content-between align-items-center border-0 shadow-sm" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '16px' }}>{l.username}</div>
                  <div className="text-muted" style={{ fontSize: '13px' }}>{l.type} • {l.startDate}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-success" style={{ borderRadius: '10px' }} onClick={() => handleAction(l.id, 'Approved')}>Approve</button>
                  <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: '10px' }} onClick={() => handleAction(l.id, 'Rejected')}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Team Status Gauges */}
        <div className="col-lg-5">
          <h4 className="fw-bold mb-3" style={{ color: '#f5576c' }}>Today's Presence</h4>
          <div className="card border-0 shadow-sm" style={{ borderRadius: '24px' }}>
            <div className="card-body p-4">
              {[
                { label: 'Present', val: 18, total: 20, color: '#10b981' },
                { label: 'On Leave', val: 2, total: 20, color: '#f5576c' },
                { label: 'Remote', val: 5, total: 20, color: '#4facfe' }
              ].map((g, i) => (
                <div className="mb-4" key={i}>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-bold" style={{ fontSize: '13px' }}>{g.label}</span>
                    <span className="text-muted" style={{ fontSize: '13px' }}>{g.val}/{g.total}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(g.val/g.total)*100}%`, background: g.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
              <hr />
              <div className="text-center">
                <button className="btn btn-link text-danger text-decoration-none fw-bold" onClick={() => navigate('/timesheet')}>View Full Report →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 👤 EMPLOYEE DASHBOARD (Blue Theme - Personal & Minimal)
// ============================================================
const EmployeeDashboard = ({ stats, user, navigate }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchMyLeaves = async () => {
      try {
        const res = await api.get('/leaves/my');
        setHistory(res.data.slice(0, 3));
      } catch (err) { console.error(err); }
    };
    fetchMyLeaves();
  }, []);

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Personal Greeting */}
      <div className="text-center mb-5 mt-4">
        <div style={{ width: '80px', height: '80px', borderRadius: '25px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', boxShadow: '0 10px 20px rgba(79,172,254,0.3)' }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="fw-bold" style={{ color: '#1e293b' }}>Hello, {user.username}! 👋</h1>
        <p className="text-muted">How are you feeling today?</p>
      </div>

      <div className="row g-4">
        {/* Quick Action - Large Button */}
        <div className="col-12">
          <div 
            onClick={() => navigate('/attendance')}
            className="card border-0 text-center p-4 shadow-sm float-anim" 
            style={{ borderRadius: '24px', background: 'white', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4facfe'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div className="card-body">
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🕒</div>
              <h4 className="fw-bold mb-1">Check In / Out</h4>
              <p className="text-muted mb-0">Quickly mark your attendance for today</p>
            </div>
          </div>
        </div>

        {/* Leave Balance & Info */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '24px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Your Summary</h5>
              <div className="d-flex align-items-center gap-3 mb-4 p-3" style={{ background: '#f0f8ff', borderRadius: '16px' }}>
                <div style={{ fontSize: '24px' }}>🌴</div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#4facfe' }}>{stats.myLeaves || 0}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Leaves Taken</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 p-3" style={{ background: '#ecfdf5', borderRadius: '16px' }}>
                <div style={{ fontSize: '24px' }}>✅</div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>{stats.approvedLeaves || 0}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Approved Requests</div>
                </div>
              </div>
              <button className="btn btn-primary w-100 mt-4" style={{ borderRadius: '12px', background: '#4facfe', border: 'none' }} onClick={() => navigate('/apply-leave')}>+ Apply for Leave</button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '24px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Recent Requests</h5>
              {history.length === 0 ? (
                <div className="text-center py-4 text-muted">No recent requests</div>
              ) : (
                history.map(l => (
                  <div key={l.id} className="d-flex justify-content-between align-items-center mb-3 p-2">
                    <div>
                      <div className="fw-bold" style={{ fontSize: '14px' }}>{l.type}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>{l.startDate}</div>
                    </div>
                    <span className={`badge ${l.status === 'Approved' ? 'bg-success' : 'bg-warning'} text-white`}>{l.status}</span>
                  </div>
                ))
              )}
              <hr />
              <h6 className="fw-bold mt-4 mb-3">Upcoming Holidays ⛱️</h6>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                <div className="mb-2">● Workers Day - May 1st</div>
                <div>● Independence Day - Aug 15th</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {user?.role === 'hr' && <HRDashboard stats={stats} user={user} navigate={navigate} />}
      {user?.role === 'manager' && <ManagerDashboard stats={stats} user={user} navigate={navigate} />}
      {user?.role === 'employee' && <EmployeeDashboard stats={stats} user={user} navigate={navigate} />}
    </div>
  );
};

export default Dashboard;
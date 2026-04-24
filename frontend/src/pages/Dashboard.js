import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const res = await axios.get('https://attendance-portal-1-u1rw.onrender.com/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const getRoleTheme = () => {
    if (user?.role === 'hr') return {
      bg: '#667eea',
      light: '#f0f4ff',
      card: 'kpi-hr',
      btn: 'btn-primary',
      icon: '👑',
      title: 'HR Administrator',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    if (user?.role === 'manager') return {
      bg: '#f5576c',
      light: '#fff0f2',
      card: 'kpi-manager',
      btn: 'btn-manager',
      icon: '📊',
      title: 'Team Manager',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    };
    return {
      bg: '#4facfe',
      light: '#f0f8ff',
      card: 'kpi-employee',
      btn: 'btn-employee',
      icon: '👤',
      title: 'Employee',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    };
  };
  
  const theme = getRoleTheme();
  
  // Permissions Data
  const permissions = {
    hr: [
      'View own attendance', 'View own leave requests', 'View team attendance',
      'View all leave requests', 'Create / Deactivate users', 'Assign roles & managers',
      'Configure leave types', 'View organization attendance'
    ],
    manager: [
      'View own attendance', 'Check in / Check out', 'Apply for leave',
      'View own leave requests', 'View team attendance', 'Approve / Reject leave'
    ],
    employee: [
      'View own attendance', 'Check in / Check out', 'Apply for leave', 'View own leave requests'
    ]
  };
  
  const deniedPermissions = {
    hr: ['Check in / Check out', 'Apply for leave', 'Approve / Reject leave'],
    manager: ['View all leave requests', 'Create / Deactivate users', 'Assign roles & managers', 'Configure leave types'],
    employee: ['View team attendance', 'Approve / Reject leave', 'View all leave requests', 'Create / Deactivate users']
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid #f0f0f0', borderTopColor: theme.bg, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
      </div>
    );
  }
  
  // HR Dashboard
  if (user?.role === 'hr') {
    const kpis = [
      { icon: '👥', title: 'Total Users', value: stats.totalUsers || 0, path: '/user-management', color: '#667eea' },
      { icon: '⏳', title: 'Pending Leaves', value: stats.pendingLeaves || 0, path: '/leave-approval', color: '#ed8936' },
      { icon: '✅', title: 'Approved', value: stats.approvedLeaves || 0, path: '/leave-approval', color: '#48bb78' },
      { icon: '🏷️', title: 'Leave Types', value: stats.totalLeaveTypes || 0, path: '/leave-config', color: '#9f7aea' }
    ];
    
    return (
      <div>
        {/* Welcome Card */}
        <div style={{
          background: theme.gradient,
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                Welcome, {user.username}! 👋
              </h1>
              <p style={{ opacity: 0.9, fontSize: '14px' }}>
                {theme.title} • {user.email}
              </p>
              <div style={{
                display: 'flex',
                gap: '16px',
                marginTop: '16px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>👥 {stats.totalUsers || 0} Total Users</span>
              </div>
            </div>
            <div style={{
              fontSize: '72px',
              background: 'rgba(255,255,255,0.1)',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '30px'
            }}>
              {theme.icon}
            </div>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {kpis.map((kpi, index) => (
            <div
              key={index}
              onClick={() => navigate(kpi.path)}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{kpi.icon}</div>
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>{kpi.title}</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
        
        {/* Permissions Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #f0f0f0'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>
            🔑 Your Access Permissions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            {permissions.hr.map((perm, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                <span style={{ color: '#10b981', fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '13px', color: '#333' }}>{perm}</span>
              </div>
            ))}
            {deniedPermissions.hr.map((perm, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                <span style={{ color: '#ef4444', fontSize: '16px' }}>❌</span>
                <span style={{ fontSize: '13px', color: '#999' }}>{perm}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid #f0f0f0'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>
            ⚡ Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className={`btn ${theme.btn}`} onClick={() => navigate('/user-management')}>👥 Manage Users</button>
            <button className={`btn ${theme.btn}`} onClick={() => navigate('/leave-config')}>⚙️ Leave Configuration</button>
            <button className={`btn ${theme.btn}`} onClick={() => navigate('/leave-approval')}>📋 View All Leaves</button>
            <button className={`btn ${theme.btn}`} onClick={() => navigate('/timesheet')}>🏢 Organization Timesheet</button>
          </div>
        </div>
      </div>
    );
  }
  
  // Manager Dashboard
  if (user?.role === 'manager') {
    const kpis = [
      { icon: '👥', title: 'Team Size', value: stats.teamSize || 0, path: '/timesheet', color: '#f5576c' },
      { icon: '⏳', title: 'Pending Approvals', value: stats.pendingLeaves || 0, path: '/leave-approval', color: '#ed8936' },
      { icon: '📝', title: 'My Leaves', value: stats.myLeaves || 0, path: '/apply-leave', color: '#48bb78' }
    ];
    
    return (
      <div>
        <div style={{
          background: theme.gradient,
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                Welcome, {user.username}! 👋
              </h1>
              <p style={{ opacity: 0.9, fontSize: '14px' }}>
                {theme.title} • {user.email}
              </p>
              <div style={{ marginTop: '16px' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                  📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '72px', background: 'rgba(255,255,255,0.1)', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '30px' }}>
              {theme.icon}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {kpis.map((kpi, index) => (
            <div key={index} onClick={() => navigate(kpi.path)} style={{ background: 'white', borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #f0f0f0' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{kpi.icon}</div>
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>{kpi.title}</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
        
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', border: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>🔑 Your Access Permissions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {permissions.manager.map((perm, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                <span style={{ color: '#10b981', fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '13px', color: '#333' }}>{perm}</span>
              </div>
            ))}
            {deniedPermissions.manager.map((perm, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                <span style={{ color: '#ef4444', fontSize: '16px' }}>❌</span>
                <span style={{ fontSize: '13px', color: '#999' }}>{perm}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className={`btn ${theme.btn}`} onClick={() => navigate('/leave-approval')}>✓ Approve Leaves</button>
            <button className={`btn ${theme.btn}`} onClick={() => navigate('/attendance')}>✅ Check In/Out</button>
            <button className={`btn ${theme.btn}`} onClick={() => navigate('/apply-leave')}>📝 Apply Leave</button>
            <button className={`btn ${theme.btn}`} onClick={() => navigate('/timesheet')}>👥 Team Timesheet</button>
          </div>
        </div>
      </div>
    );
  }
  
  // Employee Dashboard
  const kpis = [
    { icon: '📝', title: 'My Leaves', value: stats.myLeaves || 0, path: '/apply-leave', color: '#4facfe' },
    { icon: '⏳', title: 'Pending', value: stats.pendingLeaves || 0, path: '/apply-leave', color: '#ed8936' },
    { icon: '✅', title: 'Approved', value: stats.approvedLeaves || 0, path: '/apply-leave', color: '#48bb78' }
  ];
  
  return (
    <div>
      <div style={{
        background: theme.gradient,
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              Welcome, {user.username}! 👋
            </h1>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>
              {theme.title} • {user.email}
            </p>
            <div style={{ marginTop: '16px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '72px', background: 'rgba(255,255,255,0.1)', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '30px' }}>
            {theme.icon}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {kpis.map((kpi, index) => (
          <div key={index} onClick={() => navigate(kpi.path)} style={{ background: 'white', borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #f0f0f0' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{kpi.icon}</div>
            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>{kpi.title}</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>
      
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', border: '1px solid #f0f0f0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>🔑 Your Access Permissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {permissions.employee.map((perm, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
              <span style={{ color: '#10b981', fontSize: '16px' }}>✅</span>
              <span style={{ fontSize: '13px', color: '#333' }}>{perm}</span>
            </div>
          ))}
          {deniedPermissions.employee.map((perm, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
              <span style={{ color: '#ef4444', fontSize: '16px' }}>❌</span>
              <span style={{ fontSize: '13px', color: '#999' }}>{perm}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f0f0f0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>⚡ Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className={`btn ${theme.btn}`} onClick={() => navigate('/attendance')}>✅ Check In/Out</button>
          <button className={`btn ${theme.btn}`} onClick={() => navigate('/apply-leave')}>📝 Apply Leave</button>
          <button className={`btn ${theme.btn}`} onClick={() => navigate('/timesheet')}>📊 View Timesheet</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
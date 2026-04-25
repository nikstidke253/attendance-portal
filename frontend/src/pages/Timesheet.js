import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Timesheet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAttendance();
  }, []);
  
  const fetchAttendance = async () => {
    try {
      let response;
      if (user?.role === 'hr' || user?.role === 'manager') {
        response = await api.get('/attendance');
      } else {
        response = await api.get('/attendance/my');
      }
      setAttendance(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    // Dummy parsing assuming '10:00:00 AM' format from our mock DB
    try {
      const start = new Date(`1970-01-01 ${checkIn}`);
      const end = new Date(`1970-01-01 ${checkOut}`);
      const diff = (end - start) / 1000 / 60 / 60; // in hours
      if (diff < 0) return (diff + 24).toFixed(2) + ' hrs';
      return diff.toFixed(2) + ' hrs';
    } catch (e) {
      return '-';
    }
  };
  
  return (
    <div className="container py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark">
          <i className="fas fa-calendar-check text-primary me-2"></i>
          Timesheet
        </h2>
        <button className="btn btn-outline-secondary shadow-sm" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card glass-card border-0 mb-3 mb-md-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary-soft rounded-circle p-3 me-3">
                  <i className="fas fa-clock fs-4 text-primary"></i>
                </div>
                <div>
                  <p className="text-muted mb-0 fw-semibold">Total Records</p>
                  <h3 className="fw-bold mb-0 text-dark">{attendance.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card glass-card border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  {(user?.role === 'hr' || user?.role === 'manager') && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Hours Logged</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : attendance.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No attendance records found.</td>
                  </tr>
                ) : attendance.map((record, idx) => (
                  <tr key={record.id || idx}>
                    {(user?.role === 'hr' || user?.role === 'manager') && (
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary-soft rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px', height:'40px'}}>
                            <i className="fas fa-user text-primary"></i>
                          </div>
                          <div className="fw-bold text-dark">{record.username || 'Unknown'}</div>
                        </div>
                      </td>
                    )}
                    <td><span className="fw-semibold text-muted"><i className="fas fa-calendar-day me-2"></i>{record.date}</span></td>
                    <td><span className="badge bg-success-soft text-dark px-3 py-2"><i className="fas fa-sign-in-alt me-1 text-success"></i> {record.checkIn || '-'}</span></td>
                    <td>{record.checkOut ? <span className="badge bg-danger-soft text-dark px-3 py-2"><i className="fas fa-sign-out-alt me-1 text-danger"></i> {record.checkOut}</span> : '-'}</td>
                    <td>
                      {record.checkOut ? (
                        <span className="badge bg-success-soft"><i className="fas fa-check-circle me-1"></i> Completed</span>
                      ) : (
                        <span className="badge bg-warning-soft"><i className="fas fa-running me-1"></i> Working</span>
                      )}
                    </td>
                    <td><span className="fw-bold text-primary">{calculateHours(record.checkIn, record.checkOut)}</span></td>
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

export default Timesheet;
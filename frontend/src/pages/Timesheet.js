import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Timesheet = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  
  useEffect(() => {
    fetchAttendance();
  }, []);
  
  const fetchAttendance = async () => {
    try {
      let response;
      if (user?.role === 'hr' || user?.role === 'manager') {
        response = await axios.get('http://localhost:5000/api/attendance/team');
      } else {
        response = await axios.get('http://localhost:5000/api/attendance/my');
      }
      setAttendance(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div className="card">
      <h3>Timesheet</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {(user?.role === 'hr' || user?.role === 'manager') && <th>Employee</th>}
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(record => (
              <tr key={record.id}>
                {(user?.role === 'hr' || user?.role === 'manager') && (
                  <td>{record.User?.username || 'N/A'}</td>
                )}
                <td>{record.date}</td>
                <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                <td>{record.totalHours || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timesheet;
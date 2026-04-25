import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ApproveLeave() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [remarks, setRemarks] = useState({});

  const fetchData = () => {
    api.get('/leaves').then(res => {
      setData((res.data || []).filter(l => l.status === 'Pending'));
    }).catch(console.error);
  };

  useEffect(() => { fetchData(); }, []);

  const action = (id, status) => {
    api.put(`/leaves/${id}/status`, { status })
      .then(fetchData)
      .catch(err => alert(err.response?.data?.error || 'Failed'));
  };

  return (
    <div className="container py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark">
          <i className="fas fa-clipboard-check text-primary me-2"></i>
          Approve Leaves
        </h2>
        <button className="btn btn-outline-secondary shadow-sm" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left me-2"></i>Back
        </button>
      </div>

      {data.length === 0 ? (
        <div className="card glass-card border-0 text-center py-5">
          <div className="card-body">
            <i className="fas fa-check-double text-success display-4 mb-3 opacity-50"></i>
            <h4 className="text-muted">All caught up!</h4>
            <p className="text-muted">No pending leave requests at the moment.</p>
          </div>
        </div>
      ) : data.map(l => (
        <div className="card glass-card border-0 slide-in mb-3" key={l.id}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-1">
                  <i className="fas fa-user text-primary me-2"></i>{l.username}
                </h5>
                <span className="badge bg-warning-soft me-2">{l.type}</span>
                <span className="text-muted small">{l.startDate} → {l.endDate}</span>
              </div>
              <span className="badge bg-warning-soft px-3 py-2">Pending</span>
            </div>
            <p className="text-muted mb-3"><strong>Reason:</strong> {l.reason}</p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-success shadow-none"
                onClick={() => action(l.id, 'Approved')}
              >
                <i className="fas fa-check me-2"></i>Approve
              </button>
              <button
                className="btn btn-danger shadow-none"
                onClick={() => action(l.id, 'Rejected')}
              >
                <i className="fas fa-times me-2"></i>Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
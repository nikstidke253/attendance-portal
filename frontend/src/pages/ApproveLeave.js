    import { useEffect, useState } from 'react';
import api from '../api';

export default function ApproveLeave() {
  const [data, setData] = useState([]);
  const [remark, setRemark] = useState("");

  const fetchData = () => {
    api.get('/leave/pending').then(res => setData(res.data));
  };

  useEffect(() => { fetchData(); }, []);

  const action = (id, status) => {
    api.post(`/leave/approve/${id}`, { status, remark })
      .then(fetchData);
  };

  return (
    <div className="container">
      <h3>Approve Leaves</h3>

      {data.map(l => (
        <div className="card p-2 m-2" key={l.id}>
          <p>{l.type} | {l.reason}</p>

          <input
            placeholder="Remark"
            onChange={e => setRemark(e.target.value)}
          />

          <button className="btn btn-success m-1"
            onClick={() => action(l.id, "Approved")}>
            Approve
          </button>

          <button className="btn btn-danger m-1"
            onClick={() => action(l.id, "Rejected")}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
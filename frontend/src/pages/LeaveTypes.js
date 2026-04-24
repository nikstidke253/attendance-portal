import { useEffect, useState } from 'react';
import api from '../api';

export default function LeaveTypes() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({});

  const load = async () => {
    const res = await api.get('/hr/leave-type');
    setList(res.data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/hr/leave-type', form);
    load();
  };

  return (
    <div className="container mt-3">
      <h3>Leave Types</h3>

      <input placeholder="Name" className="form-control my-1"
        onChange={e => setForm({...form, name: e.target.value})} />

      <input placeholder="Quota" className="form-control my-1"
        onChange={e => setForm({...form, quota: e.target.value})} />

      <button className="btn btn-success" onClick={save}>
        Add Leave Type
      </button>

      <hr />

      {list.map(l => (
        <div key={l.id} className="card p-2 my-2">
          {l.name} - {l.quota}
        </div>
      ))}
    </div>
  );
}
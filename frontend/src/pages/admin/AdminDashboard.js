export default function AdminDashboard() {
  return (
    <div className="container mt-4">
      <h2>Admin Dashboard 👑</h2>

      <div className="row mt-4">

        <div className="col-md-3 card p-3">
          <h5>Create Users</h5>
        </div>

        <div className="col-md-3 card p-3">
          <h5>Assign Roles</h5>
        </div>

        <div className="col-md-3 card p-3">
          <h5>All Attendance</h5>
        </div>

        <div className="col-md-3 card p-3">
          <h5>Reports</h5>
        </div>

      </div>
    </div>
  );
}
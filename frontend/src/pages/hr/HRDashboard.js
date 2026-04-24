export default function HRDashboard() {
  return (
    <div className="container mt-4">
      <h2>HR Dashboard 🧑‍💼</h2>

      <div className="row">
        <div className="col-md-4 card p-3">
          <h5>Organization Attendance Overview</h5>
          <p>View attendance data for the entire organization.</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>All Employees Attendance</h5>
          <p>Access attendance records for all employees.</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>All Leave Requests</h5>
          <p>View and manage leave requests globally.</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>User Management</h5>
          <ul>
            <li>Create user</li>
            <li>Assign role (Employee / Manager)</li>
            <li>Assign reporting manager</li>
            <li>Deactivate user</li>
          </ul>
        </div>

        <div className="col-md-4 card p-3">
          <h5>Leave Configuration</h5>
          <p>Add or edit leave types (Casual, Sick, Earned).</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>System Summary</h5>
          <ul>
            <li>Total users</li>
            <li>Active users</li>
            <li>Pending approvals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
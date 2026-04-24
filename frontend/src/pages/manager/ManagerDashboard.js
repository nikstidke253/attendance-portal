export default function ManagerDashboard() {
  return (
    <div className="container mt-4">
      <h2>Manager Dashboard 📊</h2>

      <div className="row">
        <div className="col-md-4 card p-3">
          <h5>Check In / Out</h5>
          <p>View and update today's status.</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>Apply Leave</h5>
          <p>Submit a leave request.</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>My Attendance</h5>
          <p>View your timesheet summary.</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>My Leave Requests</h5>
          <p>Check the status of your leave requests (Pending / Approved / Rejected).</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>Team Attendance</h5>
          <p>View attendance of your reporting employees.</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>Leave Approval Panel</h5>
          <p>Approve or reject leave requests with remarks.</p>
        </div>

        <div className="col-md-4 card p-3">
          <h5>Team Summary</h5>
          <p>View total team members and today's present/absent status.</p>
        </div>
      </div>
    </div>
  );
}
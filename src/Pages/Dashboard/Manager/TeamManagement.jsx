import '../../../Components/Dashboard/Dashboard.css';

export default function TeamManagement() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">View and manage your team members' details.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
           <h3 className="card-title">
             <div className="card-icon"><i className="fa-solid fa-users"></i></div>
             My Team
           </h3>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="flex-cell">
                    <div className="row-icon blue">AS</div>
                    <div className="cell-primary">Alice Smith</div>
                  </div>
                </td>
                <td>Frontend Developer</td>
                <td><span className="badge success">Online</span></td>
                <td>
                  <button className="action-btn secondary"><i className="fa-regular fa-eye"></i> View Profile</button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex-cell">
                    <div className="row-icon purple">BJ</div>
                    <div className="cell-primary">Bob Johnson</div>
                  </div>
                </td>
                <td>Backend Developer</td>
                <td><span className="badge warning">On Leave</span></td>
                <td>
                  <button className="action-btn secondary"><i className="fa-regular fa-eye"></i> View Profile</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

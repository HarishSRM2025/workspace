import '../../../Components/Dashboard/Dashboard.css';

export default function RecruitmentManagement() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruitment</h1>
          <p className="page-subtitle">Handle hiring and onboarding process.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn"><i className="fa-solid fa-plus"></i> New Job Posting</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon"><i className="fa-solid fa-briefcase"></i></div>
            Active Postings
          </h3>
          <div className="header-actions">
            <button className="action-btn secondary"><i className="fa-solid fa-filter"></i> Filter</button>
          </div>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Role Title</th>
                <th>Department</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cell-primary">Senior Frontend Developer</td>
                <td>Engineering</td>
                <td className="cell-primary">24</td>
                <td><span className="badge success">Open</span></td>
                <td>
                  <div className="table-actions">
                    <button className="table-action-btn"><i className="fa-solid fa-users"></i></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="cell-primary">HR Coordinator</td>
                <td>Human Resources</td>
                <td className="cell-primary">12</td>
                <td><span className="badge warning">Interviewing</span></td>
                <td>
                  <div className="table-actions">
                    <button className="table-action-btn"><i className="fa-solid fa-users"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

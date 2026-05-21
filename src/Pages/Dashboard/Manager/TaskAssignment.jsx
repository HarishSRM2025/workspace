import '../../../Components/Dashboard/Dashboard.css';

export default function TaskAssignment() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Assign tasks and monitor your team's progress.</p>
        </div>
        <div className="header-actions">
           <button className="action-btn"><i className="fa-solid fa-plus"></i> Create Task</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
             <i className="fa-solid fa-list-ul"></i>
          </div>
          <div className="stat-info">
             <span className="stat-value">5</span>
             <span className="stat-title">To Do</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
             <i className="fa-solid fa-bars-progress"></i>
          </div>
          <div className="stat-info">
             <span className="stat-value">12</span>
             <span className="stat-title">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
             <i className="fa-solid fa-check-double"></i>
          </div>
          <div className="stat-info">
             <span className="stat-value">8</span>
             <span className="stat-title">Completed (Week)</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
           <h3 className="card-title">
             <div className="card-icon"><i className="fa-solid fa-clipboard-list"></i></div>
             Active Tasks
           </h3>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cell-primary">Update Landing Page UI design with new Tailwind classes</td>
                <td>Alice Smith</td>
                <td>Oct 20, 2023</td>
                <td><span className="badge primary">In Progress</span></td>
              </tr>
              <tr>
                <td className="cell-primary">Fix API endpoint for user data fetch</td>
                <td>Bob Johnson</td>
                <td>Oct 18, 2023</td>
                <td><span className="badge danger">Delayed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

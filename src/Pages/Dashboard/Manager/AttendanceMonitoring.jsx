import '../../../Components/Dashboard/Dashboard.css';

export default function AttendanceMonitoring() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track team attendance and working hours for today.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <i className="fa-solid fa-check"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">6 / 8</span>
            <span className="stat-title">Present Today</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">1</span>
            <span className="stat-title">Late Arrivals</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <i className="fa-solid fa-stopwatch"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">7.5 hrs</span>
            <span className="stat-title">Avg. Hours Logged</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
           <h3 className="card-title">
             <div className="card-icon"><i className="fa-regular fa-clock"></i></div>
             Today's Log
           </h3>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cell-primary">Alice Smith</td>
                <td>08:55 AM</td>
                <td>--:--</td>
                <td>4.5 hrs</td>
                <td><span className="badge success">Present</span></td>
              </tr>
              <tr>
                <td className="cell-primary">Bob Johnson</td>
                <td>--:--</td>
                <td>--:--</td>
                <td>0 hrs</td>
                <td><span className="badge danger">Absent</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

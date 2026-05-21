import '../../../Components/Dashboard/Dashboard.css';

export default function ReportsAnalytics() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Generate HR reports for attendance, payroll, and more.</p>
        </div>
        <div className="header-actions">
           <button className="action-btn"><i className="fa-solid fa-download"></i> Download Full Report (PDF)</button>
        </div>
      </div>

      <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}><i className="fa-solid fa-chart-line" style={{ marginRight: '8px' }}></i> [Attendance Chart Placeholder]</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Reports</h3>
          </div>
          <div className="table-container">
            <table className="static-table">
              <tbody>
                <tr>
                  <td className="cell-primary">Q3 Payroll Summary</td>
                  <td><button className="action-btn secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>Download</button></td>
                </tr>
                <tr>
                  <td className="cell-primary">Sept Attendance Export</td>
                  <td><button className="action-btn secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>Download</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Custom Report Generator</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div className="form-group">
              <label>Report Type</label>
              <select>
                <option>Attendance Tracking</option>
                <option>Payroll Breakdown</option>
                <option>Leave History Details</option>
              </select>
            </div>
            <button className="action-btn" style={{ width: '100%', justifyContent: 'center' }}>Generate New Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}

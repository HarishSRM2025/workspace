import '../../../Components/Dashboard/Dashboard.css';

export default function RolePermissionControl() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Role & Permission Control</h1>
          <p className="page-subtitle">Assign roles like Admin, Manager, and Employee.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn"><i className="fa-solid fa-plus"></i> Create Custom Role</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
            <div className="stat-icon-wrapper blue" style={{ width: '40px', height: '40px' }}><i className="fa-solid fa-user-tie"></i></div>
            <span className="count-badge" style={{ alignSelf: 'flex-start' }}>2 Users</span>
          </div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Admin</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Full system access including billing, settings, and full employee controls.</p>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
            <div className="stat-icon-wrapper purple" style={{ width: '40px', height: '40px' }}><i className="fa-solid fa-user-gear"></i></div>
            <span className="count-badge" style={{ alignSelf: 'flex-start' }}>8 Users</span>
          </div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Manager</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Access to manage their specific team, approve leaves, and reviews.</p>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
            <div className="stat-icon-wrapper green" style={{ width: '40px', height: '40px' }}><i className="fa-regular fa-user"></i></div>
            <span className="count-badge" style={{ alignSelf: 'flex-start' }}>145 Users</span>
          </div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Employee</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Base access. Can view their profile, payslips, and request leaves.</p>
        </div>
      </div>
    </div>
  );
}

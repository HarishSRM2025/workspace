import './Dashboard.css';

export default function Header({ slug, onLogout }) {
  const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data'));
  const getInitials = () => {
    const userName = userData?.data?.user?.user_name || userData?.data?.data?.data?.user?.user_name;
    if (userName && userName.length >= 2) return `${userName[0]}${userName[1]}`.toUpperCase();
    if (userName) return userName[0].toUpperCase();
    return 'U';
  };

  const userRole = userData?.data?.user?.role || userData?.data?.data?.data?.user?.role || 'EMPLOYEE';
  const UserRole = userRole === 'TENANT_ADMIN' ? 'Admin' : userRole === 'MANAGER' ? 'Manager' : 'Employee';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="header-title">
          PeopleOS <span className="header-separator"><i className="fa-solid fa-chevron-right"></i></span> <span className="header-title-bold">{slug} Organization</span>
        </h1>
      </div>
      
      <div className="header-right">
        {/* Subtle icon buttons matching the screenshot top right corner */}
        <button className="icon-btn" onClick={onLogout} title="Logout">
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
        <button className="icon-btn" title="Notifications">
          <i className="fa-regular fa-bell"></i>
        </button>
        <button className="icon-btn" title="Help">
          <i className="fa-regular fa-circle-question"></i>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px', marginLeft: '8px' }}>
          <span className="badge primary" style={{ textTransform: 'capitalize' }}>
            {UserRole}
          </span>
          <div className="avatar" title={userData?.data?.user?.user_name || userData?.data?.data?.data?.user?.user_name || 'User'}>
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import './Dashboard.css';
import ProfileModal from '../Profile/ProfileModal';
import { ACCENTS, applyAppearance, getStoredAccent, getStoredTheme } from '../../utils/appearance';

export default function Header({ slug, onLogout }) {
  const [theme, setTheme] = useState(getStoredTheme());
  const [accent, setAccent] = useState(getStoredAccent());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data') || '{}');

  useEffect(() => {
    applyAppearance(theme, accent);
  }, [theme, accent]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const getInitials = () => {
    const userName = userData?.data?.user?.user_name || userData?.data?.data?.data?.user?.user_name;
    if (userName && userName.length >= 2) return `${userName[0]}${userName[1]}`.toUpperCase();
    if (userName) return userName[0].toUpperCase();
    return 'U';
  };

  const userRole = userData?.data?.user?.role || userData?.data?.data?.data?.user?.role || 'EMPLOYEE';
  const UserRole = userRole === 'TENANT_ADMIN' ? 'Admin' : userRole === 'MANAGER' ? 'Manager' : 'Employee';

  return (
    <>
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="header-title">
            PeopleOS <span className="header-separator"><i className="fa-solid fa-chevron-right"></i></span> <span className="header-title-bold">{slug} Organization</span>
          </h1>
        </div>

        <div className="header-right">
          {/* Theme Mode Toggle Button */}
          <button 
            className="icon-btn" 
            onClick={toggleTheme} 
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <i className={theme === 'light' ? 'fa-regular fa-moon' : 'fa-regular fa-sun'}></i>
          </button>

          {/* Primary Color Palette Selector */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {ACCENTS.map((item) => (
              <button
                key={item.key}
                onClick={() => setAccent(item.key)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: item.value,
                  border: accent === item.key ? '2px solid var(--text-primary)' : 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                title={`Theme color: ${item.key}`}
              />
            ))}
          </div>

          <button className="icon-btn" onClick={() => setIsProfileOpen(true)} title="Profile & Password Settings">
            <i className="fa-regular fa-user"></i>
          </button>

          <button className="icon-btn" onClick={onLogout} title="Logout">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px', marginLeft: '4px' }}>
            <span className="badge primary" style={{ textTransform: 'capitalize' }}>
              {UserRole}
            </span>
            <div 
              className="avatar" 
              onClick={() => setIsProfileOpen(true)}
              title="Click to manage account & password"
              style={{ cursor: 'pointer' }}
            >
              {getInitials()}
            </div>
          </div>
        </div>
      </header>

      {isProfileOpen && (
        <ProfileModal 
          userData={userData} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}
    </>
  );
}

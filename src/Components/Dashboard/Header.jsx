import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Dashboard.css';
import { ACCENTS, applyAppearance, getStoredAccent, getStoredTheme } from '../../utils/appearance';

export default function Header({ slug, onLogout }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getStoredTheme());
  const [accent, setAccent] = useState(getStoredAccent());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAccentPanel, setShowAccentPanel] = useState(false);

  const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data') || '{}');

  useEffect(() => {
    applyAppearance(theme, accent);
  }, [theme, accent]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const getUserName = () => {
    return userData?.data?.user?.user_name || userData?.data?.data?.data?.user?.user_name || 'User';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  };

  const userRole = userData?.data?.user?.role || userData?.data?.data?.data?.user?.role || 'EMPLOYEE';
  const UserRole = userRole === 'TENANT_ADMIN' ? 'Admin' : userRole === 'MANAGER' ? 'Manager' : 'Employee';

  const accentObj = ACCENTS.find(a => a.key === accent) || ACCENTS[0];

  return (
    <header className="ws-header">
      {/* Left: Search */}
      <div className="ws-header-left">
        <div className="ws-search-box">
          <i className="fa-solid fa-magnifying-glass ws-search-icon" />
          <input
            type="text"
            className="ws-search-input"
            placeholder="Search projects, forms..."
          />
          <kbd className="ws-search-kbd">⌘K</kbd>
        </div>
      </div>

      {/* Center: Clock */}
      <div className="ws-header-center">
        <div className="ws-clock">
          <i className="fa-regular fa-clock" />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="ws-header-right">
        {/* Notification bell */}
        <button className="ws-icon-btn" title="Notifications">
          <i className="fa-regular fa-bell" />
        </button>

        {/* Theme toggle */}
        <button className="ws-icon-btn" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
          <i className={theme === 'light' ? 'fa-regular fa-moon' : 'fa-regular fa-sun'} />
        </button>

        {/* Color palette picker */}
        <div className="ws-accent-wrapper">
          <button
            className="ws-icon-btn ws-accent-trigger"
            onClick={() => setShowAccentPanel(p => !p)}
            title="Primary color"
          >
            <span className="ws-accent-dot" style={{ background: accentObj.value }} />
          </button>
          {showAccentPanel && (
            <>
              <div className="ws-accent-backdrop" onClick={() => setShowAccentPanel(false)} />
              <div className="ws-accent-panel">
                <div className="ws-accent-panel-title">Primary color</div>
                <div className="ws-accent-grid">
                  {ACCENTS.map((item) => (
                    <button
                      key={item.key}
                      className={`ws-accent-swatch ${accent === item.key ? 'active' : ''}`}
                      style={{ background: item.value }}
                      onClick={() => { setAccent(item.key); setShowAccentPanel(false); }}
                      title={item.key}
                    >
                      {accent === item.key && <i className="fa-solid fa-check" />}
                      <span>{item.key.charAt(0).toUpperCase() + item.key.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar + user name */}
        <div
          className="ws-user-chip"
          onClick={() => navigate(`/${slug}/home/employee/profile`)}
          title="My Profile & Settings"
        >
          <div className="ws-avatar">{getInitials()}</div>
          <span className="ws-user-name">{getUserName()}</span>
        </div>
      </div>
    </header>
  );
}

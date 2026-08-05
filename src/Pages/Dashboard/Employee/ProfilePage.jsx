import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ACCENTS, applyAppearance, getStoredAccent, getStoredTheme } from '../../../utils/appearance';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import '../../../Components/Dashboard/Dashboard.css';

export default function ProfilePage() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState(getStoredTheme());
  const [accent, setAccent] = useState(getStoredAccent());

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data') || '{}');
  const user = userData?.data?.user || userData?.data?.data?.user || userData?.data?.data?.data?.user || userData?.user || {};

  const userName = user.user_name || user.email || 'User';
  const initials = userName.slice(0, 2).toUpperCase();
  const userRole = user.role || 'EMPLOYEE';
  const roleBadge = userRole === 'TENANT_ADMIN' ? 'Admin' : userRole === 'MANAGER' ? 'Manager' : 'Employee';

  const handleAppearanceChange = (newTheme, newAccent) => {
    setTheme(newTheme);
    setAccent(newAccent);
    applyAppearance(newTheme, newAccent);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.user_email || user.email,
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      if (response && response.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: response?.error || response?.message || 'Failed to change password.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { key: 'profile', icon: 'fa-user', label: 'Profile Info' },
    { key: 'security', icon: 'fa-lock', label: 'Security' },
    { key: 'appearance', icon: 'fa-palette', label: 'Appearance' },
  ];

  return (
    <div className="page-container">
      {/* Page Hero Header */}
      <div className="ws-profile-hero">
        <div className="ws-profile-hero-left">
          <div className="ws-profile-avatar-lg">{initials}</div>
          <div>
            <h1 className="ws-profile-name">{userName}</h1>
            <span className="ws-profile-role-badge">{roleBadge}</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="ws-profile-tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`ws-profile-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setMessage({ type: '', text: '' }); }}
          >
            <i className={`fa-solid ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`ws-profile-msg ws-profile-msg-${message.type}`}>
          <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="ws-profile-grid-2">
          <div className="card ws-profile-info-card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="card-title">
                <div className="card-icon"><i className="fa-regular fa-user" /></div>
                Account Details
              </h3>
            </div>
            <div className="ws-profile-info-rows">
              <div className="ws-profile-info-row">
                <span className="ws-info-label">Full Name</span>
                <span className="ws-info-value">{user?.user_name || '—'}</span>
              </div>
              <div className="ws-profile-info-row">
                <span className="ws-info-label">Email Address</span>
                <span className="ws-info-value">{user?.user_email || user?.email || '—'}</span>
              </div>
              <div className="ws-profile-info-row">
                <span className="ws-info-label">Role</span>
                <span className="ws-info-value">
                  <span className={`badge ${userRole === 'TENANT_ADMIN' ? 'primary' : userRole === 'MANAGER' ? 'warning' : 'success'}`}>
                    {roleBadge}
                  </span>
                </span>
              </div>
              <div className="ws-profile-info-row">
                <span className="ws-info-label">Organization</span>
                <span className="ws-info-value" style={{ textTransform: 'capitalize' }}>{slug || '—'}</span>
              </div>
              <div className="ws-profile-info-row">
                <span className="ws-info-label">User ID</span>
                <span className="ws-info-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>{user?.id || '—'}</span>
              </div>
              {user?.tenant_id && (
                <div className="ws-profile-info-row">
                  <span className="ws-info-label">Tenant ID</span>
                  <span className="ws-info-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>{user.tenant_id}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="card-title">
                <div className="card-icon"><i className="fa-solid fa-shield-halved" /></div>
                Account Status
              </h3>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="ws-status-item">
                <div className="ws-status-dot ws-status-active" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Account Active</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Your account is in good standing</div>
                </div>
              </div>
              <div className="ws-status-item">
                <div className="ws-status-dot ws-status-active" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Email Verified</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Your email address is confirmed</div>
                </div>
              </div>
              <div className="ws-status-item">
                <div className="ws-status-dot ws-status-active" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Workspace: <span style={{ textTransform: 'capitalize' }}>{slug}</span></div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>You are a member of this workspace</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card" style={{ maxWidth: '520px' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="card-title">
              <div className="card-icon"><i className="fa-solid fa-lock" /></div>
              Change Password
            </h3>
          </div>
          <form onSubmit={handlePasswordSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter a new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="action-btn" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Updating...</> : <><i className="fa-solid fa-lock" /> Update Password</>}
            </button>
          </form>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="card-title">
                <div className="card-icon"><i className="fa-regular fa-sun" /></div>
                Theme Mode
              </h3>
            </div>
            <div style={{ padding: '24px', display: 'flex', gap: '16px' }}>
              <button
                className={`ws-theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleAppearanceChange('light', accent)}
              >
                <i className="fa-regular fa-sun" />
                <span>Light Mode</span>
              </button>
              <button
                className={`ws-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleAppearanceChange('dark', accent)}
              >
                <i className="fa-regular fa-moon" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="card-title">
                <div className="card-icon"><i className="fa-solid fa-palette" /></div>
                Primary Color
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="ws-accent-swatch-grid">
                {ACCENTS.map((item) => (
                  <button
                    key={item.key}
                    className={`ws-accent-swatch-lg ${accent === item.key ? 'active' : ''}`}
                    style={{ background: item.value }}
                    onClick={() => handleAppearanceChange(theme, item.key)}
                    title={item.key}
                  >
                    {accent === item.key && <i className="fa-solid fa-check" style={{ color: '#fff', fontSize: '16px' }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

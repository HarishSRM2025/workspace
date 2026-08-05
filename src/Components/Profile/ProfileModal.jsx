import React, { useState } from 'react';
import { ACCENTS, applyAppearance, getStoredAccent, getStoredTheme } from '../../utils/appearance';
import { API_ENDPOINTS } from '../../config/api';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function ProfileModal({ userData, onClose }) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, appearance
  const [theme, setTheme] = useState(getStoredTheme());
  const [accent, setAccent] = useState(getStoredAccent());

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const user = userData?.data?.user || userData?.data?.data?.user || userData?.data?.data?.data?.user || userData?.user || {};

  const handleAppearanceChange = (newTheme, newAccent) => {
    setTheme(newTheme);
    setAccent(newAccent);
    applyAppearance(newTheme, newAccent);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'danger', text: 'All password fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'danger', text: 'Password must be at least 6 characters.' });
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
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'danger', text: response?.error || response?.message || 'Failed to change password.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.message || 'Error updating password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>My Account & Profile</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fa-solid fa-user" style={{ marginRight: '6px' }}></i> Profile Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <i className="fa-solid fa-key" style={{ marginRight: '6px' }}></i> Security
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <i className="fa-solid fa-palette" style={{ marginRight: '6px' }}></i> Appearance
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {message.text && (
            <div className={`badge ${message.type}`} style={{ display: 'block', marginBottom: '16px', padding: '10px 14px', borderRadius: '8px' }}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                  {(user.user_name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
                    {user.user_name || 'User Profile'}
                  </h4>
                  <span className="badge primary" style={{ textTransform: 'capitalize' }}>
                    {user.role || user.user_role || 'EMPLOYEE'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="text" value={user.user_email || user.email || ''} readOnly style={{ background: 'var(--bg-color)', cursor: 'not-allowed' }} />
              </div>

              <div className="form-group">
                <label>User ID</label>
                <input type="text" value={user.id || ''} readOnly style={{ background: 'var(--bg-color)', cursor: 'not-allowed' }} />
              </div>

              {user.tenant_name && (
                <div className="form-group">
                  <label>Organization</label>
                  <input type="text" value={user.tenant_name} readOnly style={{ background: 'var(--bg-color)', cursor: 'not-allowed' }} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password" 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>

              <button className="action-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} disabled={loading}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-lock"></i>}
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Theme Mode
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className={`action-btn ${theme === 'light' ? '' : 'secondary'}`} 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleAppearanceChange('light', accent)}
                  >
                    <i className="fa-regular fa-sun"></i> Light Mode
                  </button>
                  <button 
                    className={`action-btn ${theme === 'dark' ? '' : 'secondary'}`} 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleAppearanceChange('dark', accent)}
                  >
                    <i className="fa-regular fa-moon"></i> Dark Mode
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Primary Brand Color
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                  {ACCENTS.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleAppearanceChange(theme, item.key)}
                      style={{
                        height: '42px',
                        borderRadius: '10px',
                        background: item.value,
                        border: accent === item.key ? '3px solid var(--text-primary)' : 'none',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title={item.key}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

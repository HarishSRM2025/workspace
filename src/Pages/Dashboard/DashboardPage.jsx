import { useEffect, useState } from 'react';
import { ACCENTS, applyAppearance, getStoredAccent, getStoredTheme } from '../../utils/appearance';

export default function DashboardPage({ title, icon, text }) {
  const [theme, setTheme] = useState(getStoredTheme());
  const [accent, setAccent] = useState(getStoredAccent());
  const [profile] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('hrms_tenant_user_data') || '{}');
      const user = data?.data?.user || data?.data?.data?.user || data?.user || {};
      return { name: user?.user_name || 'User', email: user?.user_email || '' };
    } catch {
      return { name: 'User', email: '' };
    }
  });

  useEffect(() => {
    applyAppearance(theme, accent);
  }, [theme, accent]);

  return (
    <div className="dash-page">
      <div className="page-shell">
        <div className="page-hero">
          <div className="hero-copy">
            <div className="eyebrow">Tenant dashboard</div>
            <h1>{title}</h1>
            <p>{text}</p>
          </div>
          <div className="hero-icon"><i className={`fa-solid ${icon}`} /></div>
        </div>

        <div className="profile-grid">
          <div className="panel-card">
            <h3>Appearance</h3>
            <div className="toggle-row">
              <button className={`pill-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>Light</button>
              <button className={`pill-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>Dark</button>
            </div>
            <div className="accent-row" style={{ marginTop: 12 }}>
              {ACCENTS.map((item) => (
                <button key={item.key} className={`accent-swatch ${accent === item.key ? 'active' : ''}`} style={{ background: item.value }} onClick={() => setAccent(item.key)} />
              ))}
            </div>
          </div>

          <div className="panel-card">
            <h3>Profile</h3>
            <div className="form-grid">
              <label><span>Name</span><input defaultValue={profile.name} /></label>
              <label><span>Email</span><input defaultValue={profile.email} /></label>
              <label><span>Current password</span><input type="password" /></label>
              <label><span>New password</span><input type="password" /></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

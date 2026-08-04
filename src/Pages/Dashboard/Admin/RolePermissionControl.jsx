import { useState, useEffect, useMemo } from 'react';
import '../../../Components/Dashboard/Dashboard.css';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

/**
 * Compute expected check-out time from a check-in time string ("HH:MM") and
 * a working-hours number. Returns "HH:MM" (24h) string.
 */
function computeCheckOut(checkInStr, hours) {
  if (!checkInStr || !hours) return null;
  const [h, m] = checkInStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  const totalMinutes = h * 60 + m + Math.round(hours * 60);
  const outH = Math.floor(totalMinutes / 60) % 24;
  const outM = totalMinutes % 60;
  return `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}`;
}

function to12Hour(time24) {
  if (!time24) return '--:--';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function RolePermissionControl() {
  const [workingHours, setWorkingHours] = useState(8.0);
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [tenantInfo, setTenantInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const user = (() => {
    const userDataStr = localStorage.getItem('hrms_tenant_user_data');
    if (!userDataStr) return {};
    try {
      const data = JSON.parse(userDataStr);
      return data?.data?.user || data?.data?.data?.user || data?.user || data?.data || {};
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const fetchTenantDetails = async () => {
    if (!user.tenant_id && !user.tenant_slug && !user.slug) return;
    try {
      const slug = user.tenant_slug || user.slug;
      if (slug) {
        const res = await fetchWithAuth(API_ENDPOINTS.TENANT_GET(slug));
        const tenantData = res?.data?.data || res?.data || res;
        if (tenantData) {
          setTenantInfo(tenantData);
          if (tenantData.working_hours_per_day) setWorkingHours(tenantData.working_hours_per_day);
          if (tenantData.standard_check_in_time) setCheckInTime(tenantData.standard_check_in_time);
        }
      }
    } catch (err) {
      console.error('Error fetching tenant details:', err);
    }
  };

  // Live preview of expected check-out time
  const expectedCheckOut = useMemo(
    () => computeCheckOut(checkInTime, parseFloat(workingHours)),
    [checkInTime, workingHours]
  );

  const handleSaveShiftSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const tenantId = tenantInfo?.id || user.tenant_id;
      if (!tenantId) {
        setError('Tenant ID not found to update settings');
        return;
      }

      const res = await fetchWithAuth(API_ENDPOINTS.TENANT_UPDATE(tenantId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          working_hours_per_day: parseFloat(workingHours),
          standard_check_in_time: checkInTime,
        })
      });

      if (res?.success || res?.data) {
        setMessage('Tenant shift configuration saved successfully!');
      } else {
        setError(res?.message || 'Failed to save shift settings');
      }
    } catch (err) {
      console.error('Error updating tenant shift settings:', err);
      setError('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Role, Permissions & Tenant Settings</h1>
          <p className="page-subtitle">Configure organization shift timings, daily working hours, and system role controls.</p>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: '#D1FAE5', color: '#065F46', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#991B1B', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i> {error}
        </div>
      )}

      {/* HR Shift Configuration Card */}
      <div className="card" style={{ marginBottom: '24px', borderTop: '4px solid var(--primary)' }}>
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon"><i className="fa-solid fa-clock"></i></div>
            HR Shift & Working Hours Configuration
          </h3>
        </div>
        <div style={{ padding: '24px' }}>
          <form onSubmit={handleSaveShiftSettings} style={{ maxWidth: '600px' }}>

            {/* Standard Check-In Time */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '6px', color: 'var(--primary)' }}></i>
                Standard Shift Check-In Time
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="time"
                  required
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  style={{ width: '180px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '16px', fontWeight: '600', background: 'var(--bg-color)' }}
                />
                <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                  ({to12Hour(checkInTime)})
                </span>
              </div>
              <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                The standard expected check-in time for all employees in this tenant.
              </p>
            </div>

            {/* Working Hours per Day */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                <i className="fa-solid fa-hourglass-half" style={{ marginRight: '6px', color: 'var(--primary)' }}></i>
                Daily Working Hours
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="24"
                  required
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  style={{ width: '150px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '16px', fontWeight: '600', background: 'var(--bg-color)' }}
                />
                <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Hours / Day</span>
              </div>
              <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Standard required working hours per day for attendance and salary calculation.
              </p>
            </div>

            {/* Auto-calculated Expected Check-Out Time Preview */}
            <div style={{ marginBottom: '28px', padding: '16px 20px', background: 'var(--bg-secondary, #f9fafb)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '6px', color: '#10B981' }}></i>
                Auto-Calculated Expected Check-Out Time
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {expectedCheckOut ? to12Hour(expectedCheckOut) : '--:--'}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Based on Check-In at <strong>{to12Hour(checkInTime)}</strong> + <strong>{workingHours} hours</strong> of work.
              </p>
            </div>

            <button type="submit" className="action-btn" disabled={saving} style={{ padding: '12px 24px' }}>
              <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i>
              {saving ? 'Saving Shift Configuration...' : 'Save Shift Configuration'}
            </button>
          </form>
        </div>
      </div>

      {/* Role Cards */}
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>System Role Overview</h3>
      <div className="stat-grid">
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
            <div className="stat-icon-wrapper blue" style={{ width: '40px', height: '40px' }}><i className="fa-solid fa-user-tie"></i></div>
            <span className="count-badge" style={{ alignSelf: 'flex-start' }}>Admin / HR</span>
          </div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Tenant Admin / HR</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Full system access including tenant settings, shift configuration, payroll, and employee management.</p>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
            <div className="stat-icon-wrapper purple" style={{ width: '40px', height: '40px' }}><i className="fa-solid fa-user-gear"></i></div>
            <span className="count-badge" style={{ alignSelf: 'flex-start' }}>Manager</span>
          </div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Manager</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Access to team Scrum task boards, performance calculation analytics, and team leave approvals.</p>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
            <div className="stat-icon-wrapper green" style={{ width: '40px', height: '40px' }}><i className="fa-regular fa-user"></i></div>
            <span className="count-badge" style={{ alignSelf: 'flex-start' }}>Employee</span>
          </div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Employee</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Base access. Can view personal profile, attendance marking, leave requests, and personal assigned tasks.</p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import '../../../Components/Dashboard/Dashboard.css';

const parseTimeString = (time) => {
  if (!time) return null;
  const [clock] = time.toString().split('.');
  const parts = clock.split(':').map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [hours, minutes, seconds = 0] = parts;
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
};

const formatTime = (time) => {
  const date = parseTimeString(time);
  return date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : '--:--';
};

const formatDuration = (start, end) => {
  const startDate = parseTimeString(start);
  const endDate = parseTimeString(end);
  if (!startDate || !endDate) return '--';
  let diff = endDate - startDate;
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000;
  }
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.round((diff % 3600000) / 60000);
  return `${hours}${minutes ? `h ${minutes}m` : 'h'}`;
};

function to12Hour(time24) {
  if (!time24) return '--:--';
  const [h, m] = time24.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '--:--';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function computeExpectedCheckOut(checkInTimeStr, workingHours) {
  if (!checkInTimeStr || !workingHours) return null;
  const [hours, minutes] = checkInTimeStr.toString().split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const totalMinutes = (hours * 60) + minutes + Math.round(workingHours * 60);
  const outHours = Math.floor(totalMinutes / 60) % 24;
  const outMinutes = totalMinutes % 60;
  return `${String(outHours).padStart(2, '0')}:${String(outMinutes).padStart(2, '0')}`;
}

function getAttendanceStartDate(user) {
  const raw = user?.created_at || user?.createdAt || user?.signup_at || user?.joined_at || user?.employee_created_at;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isBeforeStart(dateStr, startDate) {
  if (!startDate) return false;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  date.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  return date < start;
}

export default function AttendanceMarking() {
  const [attendance, setAttendance] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [todayLeave, setTodayLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tenantShift, setTenantShift] = useState({ checkIn: '09:00', workingHours: 8.0 });
  const { refreshAttendance } = useOutletContext() || {};

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

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const formattedDate = today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const attendanceStartDate = getAttendanceStartDate(user);

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch Attendance Records
      const response = await fetchWithAuth(API_ENDPOINTS.ATTENDANCE_LIST);
      const records = response?.success ? (response.data || []) : (Array.isArray(response) ? response : []);
      const myRecords = records.filter(r => r.employee_id?.toString() === user.id?.toString());
      setAllAttendance(myRecords.filter(r => !isBeforeStart(r.attendance_date, attendanceStartDate)));

      // Active/Current Attendance Record for today
      const currentActive = myRecords.find(r => r.attendance_date === todayKey && r.check_in_time && !r.check_out_time) ||
                            myRecords.find(r => r.attendance_date === todayKey);
      setAttendance(currentActive || null);

      // 2. Fetch Leave Requests for Employee
      const leaveRes = await fetchWithAuth(`${API_ENDPOINTS.LEAVE_REQUEST}?employee_id=${user.id}`);
      const leaves = Array.isArray(leaveRes) ? leaveRes : (leaveRes?.data || []);
      setLeaveRequests(leaves);

      // Check if on approved leave today
      const onLeaveToday = leaves.find(l => {
        const start = new Date(l.start_date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(l.end_date);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end && l.status === 'Approved';
      });
      setTodayLeave(onLeaveToday || null);

      // 3. Fetch Tenant Shift Details
      const slug = user.tenant_slug || user.slug;
      if (slug) {
        try {
          const tenantRes = await fetchWithAuth(API_ENDPOINTS.TENANT_GET(slug));
          const tenantData = tenantRes?.data?.data || tenantRes?.data || tenantRes;
          if (tenantData) {
            setTenantShift({
              checkIn: tenantData.standard_check_in_time || '09:00',
              workingHours: tenantData.working_hours_per_day || 8.0,
            });
          }
        } catch (e) {
          console.error('Error fetching tenant shift:', e);
        }
      }

    } catch (err) {
      console.error('Error loading attendance:', err);
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        tenant_id: user.tenant_id,
        employee_id: user.id?.toString(),
        employee_name: user.user_name || user.name || '',
        attendance_date: todayKey,
      };

      const response = await fetchWithAuth(API_ENDPOINTS.ATTENDANCE_CHECKIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.success) {
        await fetchAttendance();
        if (refreshAttendance) refreshAttendance();
      } else {
        setError(response.error || response.message || 'Check-in failed');
      }
    } catch (err) {
      setError('Error during check-in: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        tenant_id: user.tenant_id,
        employee_id: user.id?.toString(),
        attendance_date: attendance?.attendance_date || todayKey,
      };

      const response = await fetchWithAuth(API_ENDPOINTS.ATTENDANCE_CHECKOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.success) {
        await fetchAttendance();
        if (refreshAttendance) refreshAttendance();
      } else {
        setError(response.error || response.message || 'Check-out failed');
      }
    } catch (err) {
      setError('Error during check-out: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // State calculations for Check-in / Check-out buttons
  const isCheckedIn = Boolean(attendance?.check_in_time && !attendance?.check_out_time);
  const isCheckedOut = Boolean(attendance?.check_in_time && attendance?.check_out_time);

  // Expected check-out based on actual check-in + working hours
  const expectedCheckOut = useMemo(() => {
    if (attendance?.check_in_time) {
      return computeExpectedCheckOut(attendance.check_in_time, tenantShift.workingHours);
    }
    return null;
  }, [attendance?.check_in_time, tenantShift.workingHours]);

  // Standard shift expected check-out (from HR config)
  const standardCheckOut = useMemo(() => {
    const [h, m] = (tenantShift.checkIn || '09:00').split(':').map(Number);
    const totalMin = h * 60 + m + Math.round(tenantShift.workingHours * 60);
    const outH = Math.floor(totalMin / 60) % 24;
    const outM = totalMin % 60;
    return `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}`;
  }, [tenantShift]);

  // Generate 7-day Log combining Attendance, Leave Status, and Missed Check-in / LOP
  const generate7DayLog = () => {
    const log = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      if (isBeforeStart(dateStr, attendanceStartDate)) {
        log.push({
          date: dateStr,
          dateObj: d,
          attendance: null,
          leave: null,
          isToday: dateStr === todayKey,
          isBeforeStart: true,
        });
        continue;
      }

      const attRecord = allAttendance.find(r => r.attendance_date === dateStr);

      // Check if date falls within any leave request
      const leaveMatch = leaveRequests.find(l => {
        const start = new Date(l.start_date);
        start.setHours(0,0,0,0);
        const end = new Date(l.end_date);
        end.setHours(23,59,59,999);
        return d >= start && d <= end;
      });

      log.push({
        date: dateStr,
        dateObj: d,
        attendance: attRecord || null,
        leave: leaveMatch || null,
        isToday: dateStr === todayKey,
        isBeforeStart: false
      });
    }
    return log;
  };

  const logs7Days = generate7DayLog();

  const renderStatusBadge = (logItem) => {
    const { attendance: att, leave: l, isToday, isBeforeStart } = logItem;

    if (isBeforeStart) {
      return <span className="badge secondary">Before joining month</span>;
    }

    if (att) {
      if (att.check_out_time) return <span className="badge success">Present (Completed)</span>;
      if (att.check_in_time) return <span className="badge warning">Present (In Progress)</span>;
    }

    if (l) {
      if (l.status === 'Approved') {
        return <span className="badge success" style={{ background: '#10B981', color: '#fff' }}><i className="fa-solid fa-check"></i> Approved: {l.leave_type}</span>;
      }
      if (l.status === 'Pending') {
        return <span className="badge warning" style={{ background: '#F59E0B', color: '#fff' }}><i className="fa-solid fa-clock"></i> Pending: {l.leave_type}</span>;
      }
      if (l.status === 'Rejected') {
        return <span className="badge danger" style={{ background: '#EF4444', color: '#fff' }}><i className="fa-solid fa-xmark"></i> Rejected: {l.leave_type}</span>;
      }
    }

    if (isToday) {
      return <span className="badge warning">Not Checked In</span>;
    }

    // Missed check-in on past working day without approved leave -> LOP (Loss of Pay)
    return <span className="badge danger" style={{ background: '#991B1B', color: '#fff' }}><i className="fa-solid fa-triangle-exclamation"></i> LOP (Loss of Pay)</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance & Daily Log</h1>
          <p className="page-subtitle">Mark daily attendance, view leave statuses, and track LOP detection.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', marginBottom: '18px' }}>
          {error}
        </div>
      )}

      {/* Tenant Shift Info Banner */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 24px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center', borderLeft: '4px solid var(--primary)' }}>
        <div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-tertiary)', letterSpacing: '0.5px', marginBottom: '4px' }}>
            <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '4px' }}></i> Standard Check-In
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{to12Hour(tenantShift.checkIn)}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-tertiary)', letterSpacing: '0.5px', marginBottom: '4px' }}>
            <i className="fa-solid fa-hourglass-half" style={{ marginRight: '4px' }}></i> Working Hours
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{tenantShift.workingHours} hrs</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-tertiary)', letterSpacing: '0.5px', marginBottom: '4px' }}>
            <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '4px' }}></i> Expected Check-Out
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{to12Hour(standardCheckOut)}</div>
        </div>
        {isCheckedIn && expectedCheckOut && (
          <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '24px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', color: '#3B82F6', letterSpacing: '0.5px', marginBottom: '4px' }}>
              <i className="fa-solid fa-clock" style={{ marginRight: '4px' }}></i> Your Expected Check-Out
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>{to12Hour(expectedCheckOut)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Based on your actual check-in at {formatTime(attendance?.check_in_time)}
            </div>
          </div>
        )}
      </div>

      {/* Daily Check-in Card */}
      <div className="card" style={{ textAlign: 'center', padding: '48px 20px', borderTop: '4px solid var(--primary)' }}>
        <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {formattedDate}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '28px' }}>
          {todayLeave ? (
            <span className="badge warning" style={{ fontSize: '14px', background: '#F59E0B', color: 'white' }}>On Approved Leave: {todayLeave.leave_type}</span>
          ) : isCheckedIn ? (
            <span className="badge warning" style={{ fontSize: '14px' }}><i className="fa-solid fa-spinner"></i> Checked In (Session Active)</span>
          ) : isCheckedOut ? (
            <span className="badge success" style={{ fontSize: '14px' }}><i className="fa-solid fa-check"></i> Checked Out for Today</span>
          ) : (
            <span className="badge secondary" style={{ fontSize: '14px' }}>Not Checked In Today</span>
          )}
        </div>

        {/* Action Buttons: Enable/Disable Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap' }}>
          {todayLeave ? (
            <div style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '50px', background: '#10B981', color: '#fff' }}>
              <i className="fa-solid fa-umbrella-beach"></i> Enjoy your leave!
            </div>
          ) : (
            <>
              <button
                type="button"
                className="action-btn"
                style={{
                  padding: '16px 32px',
                  fontSize: '18px',
                  borderRadius: '50px',
                  background: isCheckedIn ? 'var(--text-disabled, #ccc)' : 'var(--success, #10B981)',
                  cursor: (submitting || isCheckedIn) ? 'not-allowed' : 'pointer'
                }}
                disabled={submitting || isCheckedIn}
                onClick={handleCheckIn}
              >
                <i className="fa-solid fa-fingerprint"></i> {isCheckedIn ? 'Checked In' : 'Check In'}
              </button>

              <button
                type="button"
                className="action-btn secondary"
                style={{
                  padding: '16px 32px',
                  fontSize: '18px',
                  borderRadius: '50px',
                  cursor: (submitting || !isCheckedIn) ? 'not-allowed' : 'pointer'
                }}
                disabled={submitting || !isCheckedIn}
                onClick={handleCheckOut}
              >
                <i className="fa-regular fa-clock"></i> {isCheckedOut ? 'Checked Out' : 'Check Out'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Attendance & Leave History Table with LOP Detection */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon"><i className="fa-solid fa-calendar-days"></i></div>
            7-Day Attendance Log & Leave Highlighting
          </h3>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Attendance / Leave Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading log...</td></tr>
              ) : (
                logs7Days.map(item => {
                  const checkIn = formatTime(item.attendance?.check_in_time);
                  const checkOut = formatTime(item.attendance?.check_out_time);
                  const hours = formatDuration(item.attendance?.check_in_time, item.attendance?.check_out_time);
                  return (
                    <tr key={item.date} style={{ background: item.isToday ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                      <td className="cell-primary">
                        {item.dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {item.isToday && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>(Today)</span>}
                      </td>
                      <td>{checkIn}</td>
                      <td>{checkOut}</td>
                      <td>{hours}</td>
                      <td>{renderStatusBadge(item)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

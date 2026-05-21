import { useEffect, useState } from 'react';
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
    diff += 24 * 60 * 60 * 1000; // Add 24 hours if checked out the next day
  }
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.round((diff % 3600000) / 60000);
  return `${hours}${minutes ? `h ${minutes}m` : 'h'}`;
};

export default function AttendanceMarking() {
  const [attendance, setAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { refreshAttendance } = useOutletContext();

  const user = (() => {
    const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data'));
    return userData?.data?.user || userData?.data?.data?.user || userData?.data || userData || {};
  })();

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const formattedDate = today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getCurrentAttendanceRecord = (records) => {
    const pendingRecord = records.find(record => 
      record.employee_id?.toString() === user.id?.toString() &&
      record.check_in_time && !record.check_out_time
    );
    if (pendingRecord) return pendingRecord;

    return records.find(record => 
      record.employee_id?.toString() === user.id?.toString() &&
      record.attendance_date === todayKey
    );
  };

  const getHistoryRecords = (records) => {
    return records
      .filter(record => record.employee_id?.toString() === user.id?.toString())
      .slice(0, 7);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ATTENDANCE_LIST);
      const leaveResponse = await fetchWithAuth(`${API_ENDPOINTS.LEAVE_REQUEST}?employee_id=${user.id}`);

      if (response.success) {
        const records = response.data || [];
        setAttendance(getCurrentAttendanceRecord(records));
        setAttendanceHistory(getHistoryRecords(records));
      } else {
        setError(response.message || 'Unable to load attendance data');
      }

      if (Array.isArray(leaveResponse)) {
        const todayLeave = leaveResponse.find(l => {
          const start = new Date(l.start_date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(l.end_date);
          end.setHours(23, 59, 59, 999);
          return today >= start && today <= end && l.status === 'Approved';
        });
        setLeave(todayLeave || null);
      }
    } catch (err) {
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
        fetchAttendance();
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
        fetchAttendance();
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

  const renderStatusBadge = (record) => {
    if (!record) return <span className="badge warning">Not marked</span>;
    if (record.check_out_time) return <span className="badge success">Completed</span>;
    if (record.check_in_time) return <span className="badge warning">In Progress</span>;
    return <span className="badge danger">Pending</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Record</h1>
          <p className="page-subtitle">Mark your daily attendance login/logout.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', marginBottom: '18px' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ textAlign: 'center', padding: '48px 20px', borderTop: '4px solid var(--primary)' }}>
        <div style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {formattedDate}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '28px' }}>
          {leave ? (
            <span className="badge warning" style={{ fontSize: '14px', background: '#F59E0B', color: 'white' }}>On Leave: {leave.leave_type}</span>
          ) : attendance?.attendance_date === todayKey ? (
            renderStatusBadge(attendance)
          ) : attendance?.check_in_time && !attendance?.check_out_time ? (
            <span className="badge danger">Pending Checkout ({new Date(attendance.attendance_date).toLocaleDateString()})</span>
          ) : (
            <span className="badge warning">Not checked in</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap' }}>
          {leave ? (
            <div style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '50px', background: 'var(--success)', color: '#fff' }}>
              <i className="fa-solid fa-umbrella-beach"></i> Enjoy your leave!
            </div>
          ) : (
            <>
              <button
                type="button"
                className="action-btn"
                style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '50px', background: 'var(--success)' }}
                disabled={submitting || attendance?.check_in_time}
                onClick={handleCheckIn}
              >
                <i className="fa-solid fa-fingerprint"></i> {attendance?.check_in_time ? 'Checked In' : 'Check In'}
              </button>
              <button
                type="button"
                className="action-btn secondary"
                style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '50px' }}
                disabled={submitting || !attendance?.check_in_time || attendance?.check_out_time}
                onClick={handleCheckOut}
              >
                <i className="fa-regular fa-clock"></i> {attendance?.check_out_time ? 'Checked Out' : 'Check Out'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon"><i className="fa-solid fa-clock-rotate-left"></i></div>
            This Week's Log
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                    No attendance history yet.
                  </td>
                </tr>
              ) : (
                attendanceHistory.map(record => {
                  const checkIn = formatTime(record.check_in_time);
                  const checkOut = formatTime(record.check_out_time);
                  const hours = formatDuration(record.check_in_time, record.check_out_time);
                  return (
                    <tr key={`${record.employee_id}-${record.attendance_date}`}>
                      <td className="cell-primary">{new Date(record.attendance_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                      <td>{checkIn}</td>
                      <td>{checkOut}</td>
                      <td>{hours}</td>
                      <td>{renderStatusBadge(record)}</td>
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

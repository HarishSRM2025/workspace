import { useEffect, useState } from 'react';
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

const formatDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatDuration = (start, end) => {
  const startDate = parseTimeString(start);
  const endDate = parseTimeString(end);
  if (!startDate || !endDate || endDate <= startDate) return '--';
  const diff = endDate - startDate;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.round((diff % 3600000) / 60000);
  return `${hours}${minutes ? `h ${minutes}m` : 'h'}`;
};

export default function EmployeeAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data'));
  const tenantId = userData?.data?.user?.tenant_id || userData?.data?.data?.user?.tenant_id || userData?.data?.tenant_id || userData?.tenant_id || userData?.data?.user?.tenantId || userData?.data?.tenantId || userData?.tenantId || '';

  const normalizeId = (value) => value?.toString().trim().toLowerCase() || '';
  const tenantIdNormalized = normalizeId(tenantId);

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const [employeeResponse, attendanceResponse] = await Promise.all([
        fetchWithAuth(API_ENDPOINTS.EMPLOYEE_LIST),
        fetchWithAuth(API_ENDPOINTS.ATTENDANCE_LIST),
      ]);

      if (!employeeResponse.success) {
        throw new Error(employeeResponse.message || 'Unable to fetch employee list');
      }
      if (!attendanceResponse.success) {
        throw new Error(attendanceResponse.message || 'Unable to fetch attendance');
      }

      const employees = (employeeResponse.data || []).filter(emp => !tenantIdNormalized || normalizeId(emp.tenant_id) === tenantIdNormalized);
      const allAttendance = attendanceResponse.data || [];
      const todayAttendance = allAttendance.filter(record => !tenantIdNormalized || (normalizeId(record.tenant_id) === tenantIdNormalized && record.attendance_date === todayKey));

      const combinedRecords = employees.map(emp => {
        const attendance = todayAttendance.find(record => record.employee_id?.toString() === emp.employee_id?.toString());
        return {
          id: attendance?.id || `${emp.employee_id}-${todayKey}`,
          employee_name: emp.employee_name,
          employee_id: emp.employee_id,
          status: attendance?.status || 'Absent',
          check_in_time: attendance?.check_in_time || null,
          check_out_time: attendance?.check_out_time || null,
          attendance_date: todayKey,
        };
      });

      setAttendanceRecords(combinedRecords);
    } catch (err) {
      setError('Error loading attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const statusCount = (status) => attendanceRecords.filter(record => (record.status || '').toLowerCase() === status).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Attendance</h1>
          <p className="page-subtitle">Track attendance records for your team and view real-time status.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', marginBottom: '18px' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon"><i className="fa-solid fa-user-check"></i></div>
            Today's Attendance Summary
          </h3>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px' }}>
          <div className="stat-card" style={{ borderColor: 'rgba(34,197,94,0.15)' }}>
            <div className="stat-icon-wrapper success" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{statusCount('present')}</span>
              <span className="stat-title">Present</span>
            </div>
          </div>
          <div className="stat-card" style={{ borderColor: 'rgba(234,179,8,0.15)' }}>
            <div className="stat-icon-wrapper warning" style={{ backgroundColor: '#FEF3C7', color: '#CA8A04' }}>
              <i className="fa-solid fa-clock"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{statusCount('late')}</span>
              <span className="stat-title">Late</span>
            </div>
          </div>
          <div className="stat-card" style={{ borderColor: 'rgba(220,38,38,0.15)' }}>
            <div className="stat-icon-wrapper danger" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <i className="fa-solid fa-user-times"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{statusCount('absent')}</span>
              <span className="stat-title">Absent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon"><i className="fa-solid fa-table-list"></i></div>
            Attendance Log
          </h3>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading attendance records...</td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No attendance records found.</td>
                </tr>
              ) : (
                attendanceRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.employee_name}</td>
                    <td>
                      <span className={`badge ${record.status?.toLowerCase() === 'present' ? 'success' : record.status?.toLowerCase() === 'late' ? 'warning' : 'danger'}`}>
                        {record.status || 'Unknown'}
                      </span>
                    </td>
                    <td>{formatTime(record.check_in_time)}</td>
                    <td>{formatTime(record.check_out_time)}</td>
                    <td>{formatDate(record.attendance_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../../../Components/Dashboard/Dashboard.css';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

export default function LeaveRequest() {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [formData, setFormData] = useState({
    leave_type: 'Annual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { isWorking } = useOutletContext();

  // Extract user info from local storage
  const getUserInfo = () => {
    const userDataStr = localStorage.getItem("hrms_tenant_user_data");
    if (!userDataStr) return null;
    try {
      const parsed = JSON.parse(userDataStr);
      // Gateway structure may vary: { success, data: { user: {...} } } or similar
      const innerData = parsed?.data?.data || parsed?.data || parsed;
      // In HRMSAuth we fetch Tenant info, user is the logged in one
      // The user object contains id, name, tenant_id
      return innerData?.user || innerData;
    } catch (e) {
      return null;
    }
  };

  const userInfo = getUserInfo();

  useEffect(() => {
    if (userInfo?.id) {
      fetchLeaveHistory();
    }
  }, []);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    try {
      // Use fetchWithAuth if needed, though this endpoint runs on Django (port 8000)
      // fetchWithAuth might add a Bearer token which Django currently ignores
      // We'll use standard fetch or fetchWithAuth.
      const url = `${API_ENDPOINTS.LEAVE_REQUEST}?employee_id=${userInfo.id}`;
      const response = await fetchWithAuth(url);
      if (Array.isArray(response)) {
        setLeaveHistory(response);
      } else if (response?.results) { // In case of pagination
        setLeaveHistory(response.results);
      } else {
        setLeaveHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch leave history", err);
      setError("Failed to fetch leave history.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isWorking) {
      window.alert('Warning: You must be checked in to perform this task.');
      return;
    }
    
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      setError("Please fill all fields.");
      return;
    }
    
    setError(null);
    setSubmitting(true);

    const payload = {
      tenant_id: userInfo?.tenant_id || "default_tenant",
      employee_id: userInfo?.id || "unknown_emp",
      employee_name: userInfo?.name || userInfo?.user_name || "Unknown",
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      status: "Pending"
    };

    try {
      const response = await fetch(API_ENDPOINTS.LEAVE_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit request.");
      }
      
      // Reset form
      setFormData({
        leave_type: 'Annual Leave',
        start_date: '',
        end_date: '',
        reason: ''
      });
      
      // Refresh history
      fetchLeaveHistory();
      
    } catch (err) {
      setError("Error submitting request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to calculate days between dates
  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // inclusive
    return daysDiff > 0 ? daysDiff : 0;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Request</h1>
          <p className="page-subtitle">Apply for leave and track your application status.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEE2E2', color: '#DC2626', marginBottom: '16px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        <div className="card">
          <div className="card-header">
             <h3 className="card-title">Submit New Form</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Leave Type</label>
                <select name="leave_type" value={formData.leave_type} onChange={handleInputChange}>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea name="reason" rows="4" value={formData.reason} onChange={handleInputChange} placeholder="Briefly describe the reason for your leave..." required></textarea>
              </div>
              <button type="submit" className="action-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
             <h3 className="card-title">
               <div className="card-icon"><i className="fa-regular fa-calendar"></i></div>
               Leave History
             </h3>
          </div>
          <div className="table-container">
            <table className="static-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : leaveHistory.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>No leave history found.</td></tr>
                ) : (
                  leaveHistory.map((leave) => (
                    <tr key={leave.id}>
                      <td className="cell-primary">{leave.leave_type}</td>
                      <td>{leave.start_date} to {leave.end_date}</td>
                      <td>{calculateDays(leave.start_date, leave.end_date)}</td>
                      <td>
                        <span className={`badge ${
                          leave.status === 'Approved' ? 'success' : 
                          leave.status === 'Rejected' ? 'danger' : 'warning'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

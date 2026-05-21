import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../../../Components/Dashboard/Dashboard.css';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

export default function LeaveApproval() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { isWorking } = useOutletContext();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      // Fetch only pending requests
      const url = `${API_ENDPOINTS.LEAVE_REQUEST}?status=Pending`;
      const response = await fetchWithAuth(url);
      if (Array.isArray(response)) {
        setPendingRequests(response);
      } else if (response?.results) {
        setPendingRequests(response.results);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch pending leave requests", err);
      setError("Failed to fetch pending requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!isWorking) {
      window.alert('Warning: You must be checked in to perform this task.');
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.LEAVE_REQUEST}${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus.toLowerCase()} request.`);
      }

      // Refresh the list
      fetchPendingRequests();
    } catch (err) {
      console.error(`Error updating status to ${newStatus}:`, err);
      alert(`Error updating status. Please try again.`);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Approval</h1>
          <p className="page-subtitle">Approve or reject leave requests from your team.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEE2E2', color: '#DC2626', marginBottom: '16px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
           <h3 className="card-title">
             <div className="card-icon"><i className="fa-solid fa-inbox"></i></div>
             Pending Requests
           </h3>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading pending requests...</td></tr>
              ) : pendingRequests.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No pending requests.</td></tr>
              ) : (
                pendingRequests.map(request => (
                  <tr key={request.id}>
                    <td className="cell-primary">{request.employee_name}</td>
                    <td><span className="badge primary">{request.leave_type}</span></td>
                    <td>{request.start_date} to {request.end_date}</td>
                    <td>{request.reason}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="table-action-btn" 
                          style={{ color: 'var(--success)' }} 
                          title="Approve"
                          onClick={() => handleUpdateStatus(request.id, 'Approved')}
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button 
                          className="table-action-btn" 
                          style={{ color: 'var(--danger)' }} 
                          title="Reject"
                          onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </td>
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

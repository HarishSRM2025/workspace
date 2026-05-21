import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import '../../../Components/Dashboard/Dashboard.css';

export default function ProfileManagement() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getCurrentUserId = () => {
    const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data'));
    return userData?.data?.user?.id || userData?.data?.data?.user?.id || '';
  };

  const fetchEmployeeProfile = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }

      // Fetch all employees and find the current user's profile
      const response = await fetchWithAuth(API_ENDPOINTS.EMPLOYEE_LIST);
      if (response.success && response.data) {
        const userEmployee = response.data.find(emp => emp.employee_id === userId.toString());
        if (userEmployee) {
          setEmployee(userEmployee);
        } else {
          setError('Employee profile not found. Please contact your administrator.');
        }
      } else {
        setError('Failed to load employee profile');
      }
    } catch (err) {
      setError('Error loading profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div style={{
          padding: "12px",
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
          borderRadius: "6px",
          marginBottom: "15px",
          border: "1px solid #FECACA",
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>Profile not found</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View your personal details.</p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "12px",
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
          borderRadius: "6px",
          marginBottom: "15px",
          border: "1px solid #FECACA",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',justifyContent: 'center' }}>
          <div className="avatar" style={{ width: '100px', height: '100px', fontSize: '36px', marginBottom: '16px' }}>
            {employee.employee_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }} className="cell-primary">{employee.employee_name}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>{employee.employee_role}</p>
          <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Employee ID: {employee.employee_id}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
             <h3 className="card-title">Personal Information</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Employee Name</label>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                  {employee.employee_name}
                </div>
              </div>
              <div className="form-group">
                <label>Employee ID</label>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                  {employee.employee_id}
                </div>
              </div>
              <div className="form-group">
                <label>Role</label>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                  {employee.employee_role}
                </div>
              </div>
              <div className="form-group">
                <label>Salary</label>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                  ₹{employee.employee_salary}
                </div>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                  {new Date(employee.employee_dob).toLocaleDateString()}
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                  {employee.employee_phone_number}
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <div style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', minHeight: '60px' }}>
                  {employee.employee_address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

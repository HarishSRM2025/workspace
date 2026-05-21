import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import '../../../Components/Dashboard/Dashboard.css';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const YEARS = [2024, 2025, 2026, 2027, 2028];

export default function PayrollManagement() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const today = new Date();
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(today.getFullYear());

  // Run Payroll Modal
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [runMonth, setRunMonth] = useState(today.getMonth() + 1);
  const [runYear, setRunYear] = useState(today.getFullYear());
  const [isCalculating, setIsCalculating] = useState(false);

  // User & Tenant details
  const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data'));
  const tenantId = userData?.data?.user?.tenant_id || userData?.data?.data?.user?.tenant_id || userData?.data?.tenant_id || userData?.tenant_id || userData?.data?.user?.tenantId || userData?.data?.tenantId || userData?.tenantId || '';

  const fetchSalaries = async () => {
    setLoading(true);
    setError('');
    try {
      // Build query string
      const url = `${API_ENDPOINTS.SALARY_LIST}?tenant_id=${tenantId}&month=${filterMonth}&year=${filterYear}`;
      const response = await fetchWithAuth(url);
      
      // If server returns an array directly, set it. Otherwise check wrapping
      if (Array.isArray(response)) {
        setSalaries(response);
      } else if (response.success && Array.isArray(response.data)) {
        setSalaries(response.data);
      } else {
        setSalaries([]);
      }
    } catch (err) {
      setError('Error loading salary calculations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchSalaries();
    }
  }, [filterMonth, filterYear, tenantId]);

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        tenant_id: tenantId,
        month: runMonth,
        year: runYear
      };

      const response = await fetchWithAuth(API_ENDPOINTS.SALARY_CALCULATE, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success || response.Message) {
        setSuccessMsg(response.Message || 'Payroll calculated successfully!');
        setIsRunModalOpen(false);
        // Reset filters to match the calculations we just ran
        setFilterMonth(runMonth);
        setFilterYear(runYear);
        fetchSalaries();
      } else {
        throw new Error(response.error || response.message || 'Calculation failed');
      }
    } catch (err) {
      setError('Error running payroll: ' + err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePaySalary = async (id) => {
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SALARY_PAY(id), {
        method: 'PUT'
      });

      if (response.success || response.Message) {
        setSuccessMsg(response.Message || 'Salary marked as Paid!');
        fetchSalaries();
      } else {
        throw new Error(response.error || response.message || 'Payment update failed');
      }
    } catch (err) {
      setError('Error updating salary record: ' + err.message);
    }
  };

  const handleDeleteSalary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salary calculation record?')) return;
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.SALARY_DELETE(id), {
        method: 'DELETE'
      });

      if (response.success || response.Message) {
        setSuccessMsg(response.Message || 'Salary record deleted!');
        fetchSalaries();
      } else {
        throw new Error(response.error || response.message || 'Deletion failed');
      }
    } catch (err) {
      setError('Error deleting salary record: ' + err.message);
    }
  };

  // Computations for stat cards
  const totalPayroll = salaries.reduce((sum, item) => sum + (item.net_salary || 0), 0);
  const paidCount = salaries.filter(item => item.status === 'Paid').length;
  const totalDeductions = salaries.reduce((sum, item) => sum + (item.deductions || 0), 0);

  const getMonthLabel = (mVal) => {
    const match = MONTHS.find(m => m.value === Number(mVal));
    return match ? match.label : mVal;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Manage salaries, payslips, and deductions.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={() => setIsRunModalOpen(true)}>
            <i className="fa-solid fa-play"></i> Run Payroll
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', marginBottom: '18px' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i> {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '6px', marginBottom: '18px' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> {successMsg}
        </div>
      )}

      {/* Stats Summary */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <i className="fa-solid fa-money-bill-wave"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">₹{totalPayroll.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="stat-title">Total Net Payroll ({getMonthLabel(filterMonth)})</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <i className="fa-solid fa-user-check"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{paidCount} / {salaries.length}</span>
            <span className="stat-title">Employees Paid</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <i className="fa-solid fa-circle-minus"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="stat-title">Total Deductions</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon"><i className="fa-solid fa-file-invoice"></i></div>
            Payroll History & Records
          </h3>
          <div className="header-actions" style={{ alignItems: 'center' }}>
            <div className="form-group" style={{ marginBottom: 0, flexDirection: 'row', display: 'flex', gap: '8px' }}>
              <select 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(Number(e.target.value))}
                style={{ width: '130px', padding: '6px 10px' }}
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select 
                value={filterYear} 
                onChange={(e) => setFilterYear(Number(e.target.value))}
                style={{ width: '100px', padding: '6px 10px' }}
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button className="action-btn secondary" onClick={fetchSalaries} title="Refresh records">
              <i className="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Month/Year</th>
                <th>Base Salary</th>
                <th>Days Worked</th>
                <th>LOP Days</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading payroll records...</td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>No payroll calculations found for this month/year.</td>
                </tr>
              ) : (
                salaries.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div className="flex-cell">
                        <div className="row-icon blue">
                          {(record.employee_name || 'E').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="cell-primary">{record.employee_name}</div>
                      </div>
                    </td>
                    <td>{getMonthLabel(record.month)} {record.year}</td>
                    <td>₹{record.base_salary?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'center' }}>{record.worked_days} / {record.total_days}</td>
                    <td style={{ textAlign: 'center', color: record.lop_days > 0 ? 'var(--danger)' : 'inherit' }}>
                      {record.lop_days}
                    </td>
                    <td>₹{record.deductions?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="cell-primary">₹{record.net_salary?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge ${record.status === 'Paid' ? 'success' : record.status === 'Cancelled' ? 'danger' : 'warning'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {record.status !== 'Paid' && (
                          <button 
                            className="table-action-btn"
                            onClick={() => handlePaySalary(record.id)}
                            style={{ color: 'var(--success)' }}
                            title="Mark as Paid"
                          >
                            <i className="fa-solid fa-check"></i> Pay
                          </button>
                        )}
                        <button 
                          className="table-action-btn"
                          onClick={() => handleDeleteSalary(record.id)}
                          style={{ color: 'var(--danger)' }}
                          title="Delete Calculation"
                        >
                          <i className="fa-solid fa-trash-can"></i>
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

      {/* Run Payroll Dialog Modal */}
      {isRunModalOpen && (
        <div className="modal-overlay" onClick={() => !isCalculating && setIsRunModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Run Payroll Calculation</h3>
              <button className="modal-close" onClick={() => !isCalculating && setIsRunModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleRunPayroll}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                  This will pull current employee base salaries, approved Loss of Pay (LOP) leave records, and attendance logs to calculate net salaries for the selected month and year.
                </p>
                <div className="form-group">
                  <label>Select Month</label>
                  <select 
                    value={runMonth} 
                    onChange={(e) => setRunMonth(Number(e.target.value))}
                    required
                  >
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Year</label>
                  <select 
                    value={runYear} 
                    onChange={(e) => setRunYear(Number(e.target.value))}
                    required
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="action-btn secondary" 
                  onClick={() => setIsRunModalOpen(false)}
                  disabled={isCalculating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="action-btn"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Calculating...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-calculator"></i> Calculate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

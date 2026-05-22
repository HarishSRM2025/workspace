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

const getStoredUserData = () => {
  try {
    return JSON.parse(localStorage.getItem('hrms_tenant_user_data')) || {};
  } catch {
    return {};
  }
};

const normalizeSalaryList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const formatCurrency = (value) => (
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
);

export default function PayslipAccess() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const today = new Date();
  const [filterYear, setFilterYear] = useState(today.getFullYear());
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // User & Tenant details
  const userData = getStoredUserData();
  const tenantId = userData?.data?.user?.tenant_id || userData?.data?.data?.user?.tenant_id || userData?.data?.tenant_id || userData?.tenant_id || userData?.data?.user?.tenantId || userData?.data?.tenantId || userData?.tenantId || '';
  const employeeId = userData?.data?.user?.employee_id || userData?.data?.data?.user?.employee_id || userData?.data?.user?.id || userData?.data?.data?.user?.id || userData?.id || '';

  const fetchPayslips = async () => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_ENDPOINTS.SALARY_LIST}?tenant_id=${tenantId}&employee_id=${employeeId}&year=${filterYear}`;
      const response = await fetchWithAuth(url);
      
      setSalaries(normalizeSalaryList(response));
    } catch (err) {
      setError('Error loading payslips: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId && employeeId) {
      fetchPayslips();
    }
  }, [filterYear, tenantId, employeeId]);

  const getMonthLabel = (mVal) => {
    const match = MONTHS.find(m => m.value === Number(mVal));
    return match ? match.label : mVal;
  };

  const handlePrint = (payslip) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print/download your payslip.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip_${payslip.employee_name}_${getMonthLabel(payslip.month)}_${payslip.year}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .payslip-header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; color: #1e293b; }
            .payslip-title { font-size: 16px; color: #64748b; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-col { background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
            .info-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .info-label { color: #64748b; font-weight: 500; }
            .info-value { font-weight: 600; }
            .finance-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .finance-table th { background: #f1f5f9; padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; }
            .finance-table td { padding: 12px; border: 1px solid #e2e8f0; font-size: 14px; }
            .net-pay-box { background: #eff6ff; padding: 20px; border-radius: 6px; border: 1px solid #3b7bff; display: flex; justify-content: space-between; align-items: center; }
            .net-pay-title { font-size: 18px; font-weight: bold; color: #1e3a8a; }
            .net-pay-val { font-size: 22px; font-weight: 800; color: #3b7bff; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .badge-paid { background: #d1fae5; color: #10b981; }
            .badge-calc { background: #fef3c7; color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="payslip-header">
            <h1 class="company-name">${tenantId.toUpperCase()} HR Portal</h1>
            <p class="payslip-title">Salary Slip - ${getMonthLabel(payslip.month)} ${payslip.year}</p>
          </div>
          <div class="info-grid">
            <div class="info-col">
              <div class="info-item">
                <span class="info-label">Employee Name:</span>
                <span class="info-value">${payslip.employee_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Employee ID:</span>
                <span class="info-value">${payslip.employee_id}</span>
              </div>
            </div>
            <div class="info-col">
              <div class="info-item">
                <span class="info-label">Month/Year:</span>
                <span class="info-value">${getMonthLabel(payslip.month)} / ${payslip.year}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment Status:</span>
                <span class="badge ${payslip.status === 'Paid' ? 'badge-paid' : 'badge-calc'}">${payslip.status}</span>
              </div>
            </div>
          </div>
          <table class="finance-table">
            <thead>
              <tr>
                <th>Earnings Details</th>
                <th>Amount</th>
                <th>Deductions Details</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td>${formatCurrency(payslip.base_salary)}</td>
                <td>LOP Days (${payslip.lop_days} days of LOP)</td>
                <td>${formatCurrency(payslip.deductions)}</td>
              </tr>
              <tr>
                <td><strong>Gross Earnings</strong></td>
                <td>${formatCurrency(payslip.base_salary)}</td>
                <td><strong>Total Deductions</strong></td>
                <td>${formatCurrency(payslip.deductions)}</td>
              </tr>
            </tbody>
          </table>
          <div class="net-pay-box">
            <span class="net-pay-title">Net Take-Home Salary:</span>
            <span class="net-pay-val">${formatCurrency(payslip.net_salary)}</span>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payslips</h1>
          <p className="page-subtitle">View and safely download your historical salary slips.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', marginBottom: '18px' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i> {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
           <h3 className="card-title">
             <div className="card-icon"><i className="fa-solid fa-file-invoice-dollar"></i></div>
             Salary Slips History
           </h3>
           <div className="header-actions">
             <div className="form-group" style={{ marginBottom: 0, flexDirection: 'row', display: 'flex', gap: '8px', alignItems: 'center' }}>
               <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Year:</span>
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
           </div>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Month/Year</th>
                <th>Basic Salary</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading payslips...</td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No payslips found for the selected year.</td>
                </tr>
              ) : (
                salaries.map(payslip => (
                  <tr key={payslip.id}>
                    <td className="cell-primary">
                      <i className="fa-regular fa-calendar" style={{ marginRight: '8px', color: 'var(--text-tertiary)' }}></i> 
                      {getMonthLabel(payslip.month)} {payslip.year}
                    </td>
                    <td>{formatCurrency(payslip.base_salary)}</td>
                    <td style={{ color: payslip.lop_days > 0 ? 'var(--danger)' : 'inherit' }}>
                      {formatCurrency(payslip.deductions)}
                    </td>
                    <td className="cell-primary">{formatCurrency(payslip.net_salary)}</td>
                    <td>
                      <span className={`badge ${payslip.status === 'Paid' ? 'success' : 'warning'}`}>
                        {payslip.status}
                      </span>
                    </td>
                    <td>
                       <div className="table-actions">
                          <button 
                            className="table-action-btn"
                            onClick={() => setSelectedPayslip(payslip)}
                            title="View Details"
                            style={{ marginRight: '8px' }}
                          >
                             <i className="fa-solid fa-eye"></i> View
                          </button>
                          <button 
                            className="table-action-btn"
                            onClick={() => handlePrint(payslip)}
                            title="Print Payslip"
                          >
                             <i className="fa-solid fa-print"></i> Print
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

      {/* Details Modal */}
      {selectedPayslip && (
        <div className="modal-overlay" onClick={() => setSelectedPayslip(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Salary Slip Details</h3>
              <button className="modal-close" onClick={() => setSelectedPayslip(null)}>
                &times;
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase' }}>{tenantId.toUpperCase()} HR PORTAL</h4>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Payslip for {getMonthLabel(selectedPayslip.month)} {selectedPayslip.year}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Employee Name:</span>
                    <div style={{ fontWeight: '600', marginTop: '2px' }} className="cell-primary">{selectedPayslip.employee_name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Employee ID:</span>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>{selectedPayslip.employee_id}</div>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Worked Days:</span>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>{selectedPayslip.worked_days} / {selectedPayslip.total_days}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>LOP Days:</span>
                    <div style={{ fontWeight: '600', marginTop: '2px', color: selectedPayslip.lop_days > 0 ? 'var(--danger)' : 'inherit' }}>
                      {selectedPayslip.lop_days}
                    </div>
                  </div>
                </div>
              </div>

              <table className="static-table" style={{ marginTop: '8px' }}>
                <thead>
                  <tr>
                    <th>Earnings</th>
                    <th>Amount</th>
                    <th>Deductions</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary</td>
                    <td>{formatCurrency(selectedPayslip.base_salary)}</td>
                    <td>Loss of Pay (LOP)</td>
                    <td>{formatCurrency(selectedPayslip.deductions)}</td>
                  </tr>
                  <tr style={{ fontWeight: '600', borderTop: '1px solid var(--border-color)' }}>
                    <td>Total Earnings</td>
                    <td>{formatCurrency(selectedPayslip.base_salary)}</td>
                    <td>Total Deductions</td>
                    <td>{formatCurrency(selectedPayslip.deductions)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--primary-light)',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid var(--primary)',
                marginTop: '8px'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Net Take-Home Salary
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {formatCurrency(selectedPayslip.net_salary)}
                  </div>
                </div>
                <div>
                  <span className={`badge ${selectedPayslip.status === 'Paid' ? 'success' : 'warning'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    {selectedPayslip.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="action-btn secondary" 
                onClick={() => setSelectedPayslip(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="action-btn"
                onClick={() => handlePrint(selectedPayslip)}
              >
                <i className="fa-solid fa-print"></i> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

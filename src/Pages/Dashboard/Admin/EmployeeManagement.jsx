import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import '../../../Components/Dashboard/Dashboard.css';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' or 'users'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    tenant_id: '',
    employee_id: '',
    employee_name: '',
    employee_role: '',
    employee_salary: '',
    employee_dob: '',
    employee_address: '',
    employee_phone_number: ''
  });

  const getTenantId = () => {
    const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data'));
    return userData?.data?.user?.tenant_id || userData?.data?.data?.user?.tenant_id || '';
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.EMPLOYEE_LIST);
      if (response.success) {
        setEmployees(response.data || []);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      setError('Error fetching employees: ' + err.message);
    }
  };

  // Fetch tenant users
  const fetchTenantUsers = async () => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const response = await fetchWithAuth(API_ENDPOINTS.TENANT_USERS_BY_TENANT(tenantId));
      if (response.success) {
        setTenantUsers(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching tenant users:', err);
    }
  };

  // Fetch both employees and users
  const fetchData = async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchEmployees(), fetchTenantUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get users who don't have employee records
  const getUsersWithoutEmployees = () => {
    const employeeIds = new Set(employees.map(emp => emp.employee_id));
    return tenantUsers.filter(user => !employeeIds.has(user.id.toString()));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const tenantId = getTenantId();
    if (!tenantId) {
      setError('Tenant ID not found. Please log in again.');
      return;
    }

    try {
    
      const url = editingEmployee
        ? API_ENDPOINTS.EMPLOYEE_UPDATE(editingEmployee.id)
        : API_ENDPOINTS.EMPLOYEE_CREATE;
      console.log('Submitting form to URL:', url, 'with data:', formData);
      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tenant_id: tenantId
        }),
      });

      if (response.success) {
        setShowForm(false);
        setEditingEmployee(null);
        resetForm();
        fetchData();
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      setError('Error saving employee: ' + err.message);
    }
  };

  // Handle delete (show confirmation modal)
  const handleDelete = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.EMPLOYEE_DELETE(employeeToDelete.id), {
        method: 'DELETE',
      });

      if (response.success) {
        fetchData();
        setShowDeleteConfirm(false);
        setEmployeeToDelete(null);
      } else {
        setError(response.message || response.error || 'Failed to delete employee');
      }
    } catch (err) {
      setError('Error deleting employee: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  // Handle edit
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      tenant_id: employee.tenant_id,
      employee_id: employee.employee_id,
      employee_name: employee.employee_name,
      employee_role: employee.employee_role,
      employee_salary: employee.employee_salary,
      employee_dob: employee.employee_dob,
      employee_address: employee.employee_address,
      employee_phone_number: employee.employee_phone_number
    });
    setShowForm(true);
  };

  // Handle create employee from user
  const handleCreateFromUser = (user) => {
    setEditingEmployee(null);
    setFormData({
      tenant_id:  '',
      employee_id: user.id?.toString() || user.user_id?.toString() || '',
      employee_name: user.user_name || user.name || '',
      employee_role: '',
      employee_salary: '',
      employee_dob: '',
      employee_address: '',
      employee_phone_number: (() => {
        let phone = user.user_phone || user.user_phone_number || '';
        return phone.length > 10 ? phone.slice(-10) : phone;
      })(),
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tenant_id: '',
      employee_id: '',
      employee_name: '',
      employee_role: '',
      employee_salary: '',
      employee_dob: '',
      employee_address: '',
      employee_phone_number: ''
    });
    setEditingEmployee(null);
  };

  // Filter data based on search
  const filteredEmployees = employees.filter(employee =>
    employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = getUsersWithoutEmployees().filter(user =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">Manage employee records and user accounts.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn secondary" onClick={fetchData}>
            <i className="fa-solid fa-refresh"></i> Refresh
          </button>
          <button className="action-btn" onClick={() => { setEditingEmployee(null); resetForm(); setShowForm(true); }}>
            <i className="fa-solid fa-plus"></i> New Employee
          </button>
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

      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            Employee Records ({employees.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Pending Users ({getUsersWithoutEmployees().length})
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{employees.length}</span>
            <span className="stat-title">Total Employees</span>
            <span className="stat-trend neutral"><i className="fa-solid fa-minus"></i> Active</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{getUsersWithoutEmployees().length}</span>
            <span className="stat-title">Pending Users</span>
            <span className="stat-trend neutral"><i className="fa-solid fa-minus"></i> Need Details</span>
          </div>
        </div>
      </div>

      {activeTab === 'employees' ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <div className="card-icon"><i className="fa-solid fa-list-ul"></i></div>
              All Employees <span className="count-badge">{filteredEmployees.length} of {employees.length}</span>
            </h3>
            <div className="header-actions">
              <div className="search-input-wrapper">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="action-btn secondary"><i className="fa-solid fa-filter"></i> Filter</button>
            </div>
          </div>

          <div className="table-container">
            <table className="static-table">
              <thead>
                <tr>
                  <th>Employee Name <i className="fa-solid fa-sort"></i></th>
                  <th>Role <i className="fa-solid fa-sort"></i></th>
                  <th>Phone <i className="fa-solid fa-sort"></i></th>
                  <th>Salary <i className="fa-solid fa-sort"></i></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>
                      <div className="flex-cell">
                        <div className="row-icon blue">
                          {employee.employee_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="cell-primary">{employee.employee_name}</div>
                          <div style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>
                            DOB: {new Date(employee.employee_dob).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{employee.employee_role}</td>
                    <td>{employee.employee_phone_number}</td>
                    <td>₹{employee.employee_salary}</td>
                    <td>
                      <div className="table-actions">
                        <button className="table-action-btn" onClick={() => handleEdit(employee)}>
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button className="table-action-btn" onClick={() => handleDelete(employee)}>
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '50px' }}>
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <div className="card-icon"><i className="fa-solid fa-user-plus"></i></div>
              Users Without Employee Records <span className="count-badge">{filteredUsers.length}</span>
            </h3>
            <div className="header-actions">
              <div className="search-input-wrapper">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="static-table">
              <thead>
                <tr>
                  <th>User Name <i className="fa-solid fa-sort"></i></th>
                  <th>Email <i className="fa-solid fa-sort"></i></th>
                  <th>Phone <i className="fa-solid fa-sort"></i></th>
                  <th>Role <i className="fa-solid fa-sort"></i></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex-cell">
                        <div className="row-icon purple">
                          {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="cell-primary">{user.user_name}</div>
                          <div style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{user.user_email}</td>
                    <td>{user.user_phone}</td>
                    <td><span className="badge primary">{user.user_role}</span></td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="table-action-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation();console.log(user); handleCreateFromUser(user); }}>
                          <i className="fa-solid fa-plus"></i> Create Employee
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '50px' }}>
                      No pending users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    required
                    placeholder="Enter employee ID (should match tenant user ID)"
                  />
                </div>
                <div className="form-group">
                  <label>Employee Name *</label>
                  <input
                    type="text"
                    value={formData.employee_name}
                    onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <input
                    type="text"
                    value={formData.employee_role}
                    onChange={(e) => setFormData({...formData, employee_role: e.target.value})}
                    required
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div className="form-group">
                  <label>Salary *</label>
                  <input
                    type="number"
                    value={formData.employee_salary}
                    onChange={(e) => setFormData({...formData, employee_salary: e.target.value})}
                    required
                    placeholder="Enter salary amount"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.employee_dob}
                    onChange={(e) => setFormData({...formData, employee_dob: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.employee_phone_number}
                    onChange={(e) => setFormData({...formData, employee_phone_number: e.target.value})}
                    required
                    placeholder="Enter phone number"
                    maxLength="10"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Address *</label>
                  <textarea
                    value={formData.employee_address}
                    onChange={(e) => setFormData({...formData, employee_address: e.target.value})}
                    required
                    placeholder="Enter full address"
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="action-btn secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit"  className="action-btn">
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && employeeToDelete && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isDeleting && cancelDelete()}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626'
                }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                    Delete Employee
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={cancelDelete}
                disabled={isDeleting}
                style={{ position: 'absolute', top: '20px', right: '20px' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{employeeToDelete.employee_name}</strong>?
                This will permanently remove the employee record and cannot be undone.
              </p>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <button
                type="button"
                className="action-btn secondary"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-btn"
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

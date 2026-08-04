import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../../../Components/Dashboard/Dashboard.css';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

export default function TaskAssignment() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { isWorking } = useOutletContext() || {};

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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    employee_id: '',
    employee_name: '',
    priority: 'Medium',
    due_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Tasks
      const tasksUrl = user.tenant_id 
        ? `${API_ENDPOINTS.TASK_LIST}?tenant_id=${user.tenant_id}` 
        : API_ENDPOINTS.TASK_LIST;
      const tasksRes = await fetchWithAuth(tasksUrl);
      const taskList = tasksRes?.data || (Array.isArray(tasksRes) ? tasksRes : []);
      setTasks(taskList);

      // 2. Fetch Employee List for dropdown
      const empRes = await fetchWithAuth(API_ENDPOINTS.EMPLOYEE_LIST);
      const empList = empRes?.data || (Array.isArray(empRes) ? empRes : []);
      setEmployees(empList);

      // 3. Fetch Performance Analytics from Tenant Stats
      if (user.tenant_id) {
        const statsRes = await fetchWithAuth(`${API_ENDPOINTS.TENANT_STATS}?tenant_id=${user.tenant_id}`);
        if (statsRes?.data?.performance) {
          setPerformance(statsRes.data.performance);
        }
      }
    } catch (err) {
      console.error('Error fetching task assignment data:', err);
      setError('Failed to load tasks data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.employee_id) {
      alert('Please fill in required fields (Title and Assignee)');
      return;
    }

    setSubmitting(true);
    try {
      const selectedEmp = employees.find(e => e.id?.toString() === formData.employee_id?.toString() || e.employee_id?.toString() === formData.employee_id?.toString());
      const payload = {
        tenant_id: user.tenant_id,
        employee_id: formData.employee_id,
        employee_name: selectedEmp?.employee_name || formData.employee_name || 'Employee',
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.due_date || null,
        status: 'To Do'
      };

      const res = await fetchWithAuth(API_ENDPOINTS.TASK_CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.success || res.id) {
        setShowCreateModal(false);
        setFormData({ title: '', description: '', employee_id: '', employee_name: '', priority: 'Medium', due_date: '' });
        fetchData();
      } else {
        alert(res.message || 'Failed to create task');
      }
    } catch (err) {
      console.error('Task creation error:', err);
      alert('Task creation failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.TASK_UPDATE(taskId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.success || res.id) {
        fetchData();
      } else {
        alert('Failed to update task status');
      }
    } catch (err) {
      console.error('Status change error:', err);
      alert('Failed to update task status: ' + err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetchWithAuth(API_ENDPOINTS.TASK_DELETE(taskId), { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  // Filtering
  const filteredTasks = tasks.filter(task => {
    const matchesEmployee = !selectedEmployeeFilter || task.employee_id?.toString() === selectedEmployeeFilter.toString();
    const matchesSearch = !searchQuery || 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.employee_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEmployee && matchesSearch;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'Done');

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'primary';
      default: return 'secondary';
    }
  };

  const getRatingBadgeClass = (rating) => {
    switch (rating) {
      case 'Outstanding': return 'success';
      case 'Good': return 'primary';
      case 'Average': return 'warning';
      default: return 'danger';
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Scrum & Task Management</h1>
          <p className="page-subtitle">Kanban board, team task tracking, and employee performance analytics.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={() => setShowCreateModal(true)}>
            <i className="fa-solid fa-plus"></i> Create Task
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '220px' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Search by task title or employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Filter Employee:</label>
            <select 
              value={selectedEmployeeFilter} 
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
            >
              <option value="">All Tenant Employees ({employees.length})</option>
              {employees.map(emp => (
                <option key={emp.id || emp.employee_id} value={emp.id || emp.employee_id}>
                  {emp.employee_name} ({emp.employee_role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
        <i className="fa-solid fa-table-columns" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
        Kanban Task Board
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* COLUMN 1: TO DO */}
        <div className="card" style={{ background: 'var(--bg-secondary)', borderTop: '4px solid #F59E0B' }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-hourglass-start" style={{ color: '#F59E0B' }}></i>
              To Do ({todoTasks.length})
            </h4>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px' }}>
            {todoTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', margin: 'auto' }}>No tasks in To Do</p>
            ) : (
              todoTasks.map(task => (
                <div key={task.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                    <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px' }} title="Delete Task">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600' }}>{task.title}</h5>
                  {task.description && <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{task.description}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-color-light)', paddingTop: '10px' }}>
                    <span><i className="fa-regular fa-user"></i> {task.employee_name || 'Unassigned'}</span>
                    <span><i className="fa-regular fa-clock"></i> {task.due_date || 'No Date'}</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="action-btn secondary" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => handleStatusChange(task.id, 'In Progress')}>
                      Move to In Progress &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div className="card" style={{ background: 'var(--bg-secondary)', borderTop: '4px solid #3B82F6' }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-spinner" style={{ color: '#3B82F6' }}></i>
              In Progress ({inProgressTasks.length})
            </h4>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px' }}>
            {inProgressTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', margin: 'auto' }}>No tasks in progress</p>
            ) : (
              inProgressTasks.map(task => (
                <div key={task.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                    <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px' }} title="Delete Task">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600' }}>{task.title}</h5>
                  {task.description && <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{task.description}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-color-light)', paddingTop: '10px' }}>
                    <span><i className="fa-regular fa-user"></i> {task.employee_name || 'Unassigned'}</span>
                    <span><i className="fa-regular fa-clock"></i> {task.due_date || 'No Date'}</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <button className="action-btn secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => handleStatusChange(task.id, 'To Do')}>
                      &larr; To Do
                    </button>
                    <button className="action-btn" style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleStatusChange(task.id, 'Done')}>
                      Complete &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: DONE */}
        <div className="card" style={{ background: 'var(--bg-secondary)', borderTop: '4px solid #10B981' }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#10B981' }}></i>
              Done ({doneTasks.length})
            </h4>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px' }}>
            {doneTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', margin: 'auto' }}>No completed tasks</p>
            ) : (
              doneTasks.map(task => (
                <div key={task.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', opacity: 0.9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge success">Done</span>
                    <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px' }} title="Delete Task">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{task.title}</h5>
                  {task.description && <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-tertiary)' }}>{task.description}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-color-light)', paddingTop: '10px' }}>
                    <span><i className="fa-regular fa-user"></i> {task.employee_name || 'Unassigned'}</span>
                    <span style={{ color: 'var(--success)' }}><i className="fa-solid fa-check"></i> Completed</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button className="action-btn secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => handleStatusChange(task.id, 'In Progress')}>
                      &larr; Reopen
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Employee Performance Analytics Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon"><i className="fa-solid fa-chart-line"></i></div>
            Employee Performance Analytics (Calculated from Task Completion)
          </h3>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Employee ID</th>
                <th>Assigned Tasks</th>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Completion Rate</th>
                <th>Performance Rating</th>
              </tr>
            </thead>
            <tbody>
              {performance.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No task data available yet for performance calculation.</td></tr>
              ) : (
                performance.map((emp, idx) => (
                  <tr key={idx}>
                    <td className="cell-primary">{emp.employee_name}</td>
                    <td>{emp.employee_id}</td>
                    <td>{emp.total_tasks}</td>
                    <td style={{ color: 'var(--success)', fontWeight: '600' }}>{emp.completed_tasks}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: '500' }}>{emp.in_progress_tasks}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--border-color-light)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${emp.completion_rate}%`, height: '100%', background: emp.completion_rate >= 70 ? '#10B981' : emp.completion_rate >= 50 ? '#F59E0B' : '#EF4444' }}></div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{emp.completion_rate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRatingBadgeClass(emp.rating)}`}>
                        {emp.rating}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Assign New Task</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Task Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Update API endpoint for payroll calculation" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Assign To Employee *</label>
                <select 
                  required
                  value={formData.employee_id}
                  onChange={(e) => {
                    const empId = e.target.value;
                    const emp = employees.find(item => item.id?.toString() === empId || item.employee_id?.toString() === empId);
                    setFormData({
                      ...formData,
                      employee_id: empId,
                      employee_name: emp?.employee_name || ''
                    });
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id || emp.employee_id} value={emp.id || emp.employee_id}>
                      {emp.employee_name} ({emp.employee_role})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Due Date</label>
                <input 
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Description</label>
                <textarea 
                  rows="3"
                  placeholder="Task details and instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="action-btn secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="action-btn" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

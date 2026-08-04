import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../../../Components/Dashboard/Dashboard.css';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

export default function TaskAssignments() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    setLoading(true);
    setError('');
    try {
      // Filter tasks by employee_id so employees only see their OWN tasks
      const empId = user.id || user.employee_id;
      const url = empId 
        ? `${API_ENDPOINTS.TASK_LIST}?employee_id=${empId}` 
        : API_ENDPOINTS.TASK_LIST;

      const res = await fetchWithAuth(url);
      const taskList = res?.data || (Array.isArray(res) ? res : []);
      setTasks(taskList);
    } catch (err) {
      console.error('Error fetching employee tasks:', err);
      setError('Failed to load your assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (!isWorking) {
      window.alert('Warning: You must be checked in to update task status.');
      return;
    }

    try {
      const res = await fetchWithAuth(API_ENDPOINTS.TASK_UPDATE(taskId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.success || res.id) {
        fetchMyTasks();
      } else {
        alert('Failed to update task status');
      }
    } catch (err) {
      console.error('Status change error:', err);
      alert('Failed to update task status: ' + err.message);
    }
  };

  const filteredTasks = tasks.filter(task => 
    !searchQuery || task.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Kanban Tasks</h1>
          <p className="page-subtitle">View your assigned tasks and update progress in real-time.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEE2E2', color: '#DC2626', marginBottom: '16px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Search */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div className="search-input-wrapper" style={{ maxWidth: '400px' }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="Search my tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* COLUMN 1: TO DO */}
        <div className="card" style={{ background: 'var(--bg-secondary)', borderTop: '4px solid #F59E0B' }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-hourglass-start" style={{ color: '#F59E0B' }}></i>
              To Do ({todoTasks.length})
            </h4>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', margin: 'auto' }}>Loading tasks...</p>
            ) : todoTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', margin: 'auto' }}>No tasks in To Do</p>
            ) : (
              todoTasks.map(task => (
                <div key={task.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}><i className="fa-regular fa-clock"></i> {task.due_date || 'No Due Date'}</span>
                  </div>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600' }}>{task.title}</h5>
                  {task.description && <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{task.description}</p>}
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="action-btn" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleStatusChange(task.id, 'In Progress')}>
                      Start Task &rarr;
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
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', margin: 'auto' }}>Loading tasks...</p>
            ) : inProgressTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', margin: 'auto' }}>No tasks in progress</p>
            ) : (
              inProgressTasks.map(task => (
                <div key={task.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}><i className="fa-regular fa-clock"></i> {task.due_date || 'No Due Date'}</span>
                  </div>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600' }}>{task.title}</h5>
                  {task.description && <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{task.description}</p>}
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <button className="action-btn secondary" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => handleStatusChange(task.id, 'To Do')}>
                      &larr; Move Back
                    </button>
                    <button className="action-btn" style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleStatusChange(task.id, 'Done')}>
                      Mark Complete &rarr;
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
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', margin: 'auto' }}>Loading tasks...</p>
            ) : doneTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', margin: 'auto' }}>No completed tasks</p>
            ) : (
              doneTasks.map(task => (
                <div key={task.id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', opacity: 0.9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge success">Completed</span>
                    <span style={{ fontSize: '12px', color: 'var(--success)' }}><i className="fa-solid fa-check"></i> Done</span>
                  </div>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{task.title}</h5>
                  {task.description && <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-tertiary)' }}>{task.description}</p>}
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button className="action-btn secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => handleStatusChange(task.id, 'In Progress')}>
                      &larr; Reopen Task
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

import { useOutletContext } from 'react-router-dom';
import '../../../Components/Dashboard/Dashboard.css';

export default function TaskAssignments() {
  const { isWorking } = useOutletContext();

  const handleStatusChange = (e) => {
    if (!isWorking) {
      e.preventDefault();
      window.alert('Warning: You must be checked in to perform this task.');
      // Revert the select element to its original state (visually)
      e.target.value = e.target.getAttribute('data-initial-value') || e.target.children[0].value;
      return;
    }
    // Normal logic would go here
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">Check your assigned tasks and update progress.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
             <div className="card-icon"><i className="fa-solid fa-list-check"></i></div>
             To Do
          </h3>
          <div className="header-actions">
            <div className="search-input-wrapper">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search tasks..." />
            </div>
            <button className="action-btn secondary"><i className="fa-solid fa-filter"></i> Filter</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 className="cell-primary" style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Update User Flow Documentation</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}><i className="fa-regular fa-clock" style={{ color: 'var(--danger)' }}></i> Due: Tomorrow</p>
            </div>
            <div>
              <select className="form-group" style={{ margin: 0, padding: '8px 16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} data-initial-value="To Do" onChange={handleStatusChange}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 className="cell-primary" style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Design Homepage Assets</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}><i className="fa-regular fa-clock" style={{ color: 'var(--text-tertiary)' }}></i> Due: Oct 20, 2023</p>
            </div>
            <div>
              <select className="form-group" defaultValue="In Progress" style={{ margin: 0, padding: '8px 16px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', fontWeight: '600' }} data-initial-value="In Progress" onChange={handleStatusChange}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

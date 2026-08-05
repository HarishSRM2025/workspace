import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Dashboard.css';
import ProfileModal from '../Profile/ProfileModal';

export default function Sidebar({ role, slug }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem('hrms_tenant_user_data') || '{}');
  const user = userData?.data?.user || userData?.data?.data?.user || userData?.data?.data?.data?.user || userData?.user || {};

  const getLinks = () => {
    switch(role) {
      case 'TENANT_ADMIN':
        return [
          { section: 'MAIN', links: [
            { name: 'Dashboard Home', path: `/${slug}/home`, icon: 'fa-solid fa-house', exact: true },
            { name: 'Employees', path: `/${slug}/home/admin/employees`, icon: 'fa-solid fa-users' },
            { name: 'Attendance', path: `/${slug}/home/admin/attendance`, icon: 'fa-solid fa-clock' },
            { name: 'Payroll', path: `/${slug}/home/admin/payroll`, icon: 'fa-solid fa-money-check-dollar' },
            { name: 'Recruitment', path: `/${slug}/home/admin/recruitment`, icon: 'fa-solid fa-briefcase' },
            { name: 'Reports', path: `/${slug}/home/admin/reports`, icon: 'fa-solid fa-chart-pie' },
          ]},
          { section: 'Personal Dashboard', links: [
            { name: 'Attendance Record', path: `/${slug}/home/employee/attendance`, icon: 'fa-solid fa-fingerprint' },
            { name: 'Leave Requests', path: `/${slug}/home/employee/leaves`, icon: 'fa-solid fa-calendar-plus' },
            { name: 'Payslips', path: `/${slug}/home/employee/payslips`, icon: 'fa-solid fa-file-invoice-dollar' },
            { name: 'My Tasks', path: `/${slug}/home/employee/tasks`, icon: 'fa-solid fa-list-ul' },
          ]},
          { section: 'SYSTEM', links: [
            { name: 'Role & Permissions', path: `/${slug}/home/admin/roles`, icon: 'fa-solid fa-shield-halved' },
          ]}
        ];
      case 'MANAGER':
        return [
          { section: 'MAIN', links: [
            { name: 'Dashboard Home', path: `/${slug}/home`, icon: 'fa-solid fa-house', exact: true },
            { name: 'My Team', path: `/${slug}/home/manager/team`, icon: 'fa-solid fa-people-group' },
            { name: 'Attendance', path: `/${slug}/home/manager/attendance`, icon: 'fa-solid fa-clock' },
            { name: 'Leave Approvals', path: `/${slug}/home/manager/leaves`, icon: 'fa-solid fa-calendar-check' },
            { name: 'Tasks', path: `/${slug}/home/manager/tasks`, icon: 'fa-solid fa-list-check' },
          ]},
          { section: 'REVIEWS', links: [
            { name: 'Performance', path: `/${slug}/home/manager/performance`, icon: 'fa-solid fa-star' },
          ]}
        ];
      case 'EMPLOYEE':
      default:
        return [
          { section: 'MAIN', links: [
            { name: 'Dashboard Home', path: `/${slug}/home`, icon: 'fa-solid fa-house', exact: true },
            { name: 'Attendance Record', path: `/${slug}/home/employee/attendance`, icon: 'fa-solid fa-fingerprint' },
            { name: 'Leave Requests', path: `/${slug}/home/employee/leaves`, icon: 'fa-solid fa-calendar-plus' },
            { name: 'Payslips', path: `/${slug}/home/employee/payslips`, icon: 'fa-solid fa-file-invoice-dollar' },
            { name: 'My Tasks', path: `/${slug}/home/employee/tasks`, icon: 'fa-solid fa-list-ul' },
          ]}
        ];
    }
  };

  const menuSections = getLinks();
  const userName = user.user_name || user.email || 'User';
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header" style={{ borderBottom: '1px solid var(--border-color)', margin: 0, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-logo-icon">
               <i className="fa-solid fa-cloud" style={{ fontSize: '14px' }}></i>
            </div>
            <h2 className="sidebar-title" style={{ fontSize: '16px', margin: 0 }}>
              PeopleOS <span style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '4px' }}>HRMS</span>
            </h2>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          {menuSections.map((sectionData) => (
            <div key={sectionData.section}>
              <div className="menu-section">{sectionData.section}</div>
              {sectionData.links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.exact}
                  className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                >
                  <span className="menu-icon"><i className={link.icon}></i></span>
                  {link.name}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}
            onClick={() => setIsProfileOpen(true)}
            title="Open Account & Password Settings"
          >
            <div className="sidebar-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                {userName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                View Profile & Settings
              </div>
            </div>
            <i className="fa-solid fa-gear" style={{ color: 'var(--text-tertiary)' }}></i>
          </div>
        </div>
      </aside>

      {isProfileOpen && (
        <ProfileModal 
          userData={userData}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}

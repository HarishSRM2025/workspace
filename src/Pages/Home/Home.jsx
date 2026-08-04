import { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../Components/Dashboard/Sidebar';
import Header from '../../Components/Dashboard/Header';
import '../../Components/Dashboard/Dashboard.css';
import { API_ENDPOINTS } from '../../config/api';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function Home() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [tenantStats, setTenantStats] = useState(null);
  
  // Attendance Guard State
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const userDataStr = localStorage.getItem('hrms_tenant_user_data');
    if (!userDataStr) {
      navigate(`/${slug}/auth`, { replace: true });
      return;
    }
    try {
      const data = JSON.parse(userDataStr);
      setUserData(data);
      setLoading(false);
      fetchRecentActivities(data);
      fetchTodayAttendance(data);
      fetchTenantStats(data);
    } catch (err) {
      console.error('Error parsing user data:', err);
      localStorage.removeItem('hrms_tenant_user_data');
      navigate(`/${slug}/auth`, { replace: true });
    }
  }, [slug, navigate]);

  const fetchTenantStats = async (data) => {
    try {
      const user = data?.data?.user || data?.data?.data?.user || data?.data?.data?.data?.user || data?.user || data?.data;
      const tenantId = user?.tenant_id;
      if (tenantId) {
        const response = await fetchWithAuth(`${API_ENDPOINTS.TENANT_STATS}?tenant_id=${tenantId}`);
        if (response?.success && response.data) {
          setTenantStats(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tenant stats:', err);
    }
  };

  const fetchTodayAttendance = async (data) => {
    try {
      const user = data?.data?.user || data?.data?.data?.user || data?.data?.data?.data?.user || data?.user || data?.data;
      const todayKey = new Date().toISOString().slice(0, 10);
            
      const response = await fetchWithAuth(API_ENDPOINTS.ATTENDANCE_LIST);
      if (response.success && response.data) {
        const todayRecord = response.data.find(r => 
          r.employee_id?.toString() === user?.id?.toString() && 
          r.attendance_date === todayKey
        );
        setIsWorking(!!(todayRecord && todayRecord.check_in_time && !todayRecord.check_out_time));
      }
    } catch (err) {
      console.error('Failed to fetch today attendance for guard:', err);
    }
  };

  const fetchRecentActivities = async (data) => {
    try {
      // Extract employee ID
      const user = data?.data?.user || data?.data?.data?.user || data?.data?.data?.data?.user || data?.user || data?.data;
      const employeeId = user?.id;
      
      const url = employeeId 
        ? `${API_ENDPOINTS.ACTIVITY_LOG}?employee_id=${employeeId}` 
        : API_ENDPOINTS.ACTIVITY_LOG;
        
      const response = await fetchWithAuth(url);
      if (Array.isArray(response)) {
        setRecentActivities(response.slice(0, 5));
      } else if (response?.results) {
        setRecentActivities(response.results.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch recent activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hrms_tenant_user_data');
    navigate(`/${slug}/auth`, { replace: true });
  };

  if (loading) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;
  }

  const userRole = userData?.data?.user?.role || userData?.data?.data?.data?.user?.role || 'Manager';
  // Also fix the layout to match the widgets requested by using the exact styling blocks just created
  const isExactHome = location.pathname === `/${slug}/home` || location.pathname === `/${slug}/home/`;

  return (
    <div className="dashboard-layout">
      <Sidebar role={userRole} slug={slug} />
      
      <div className="main-wrapper">
        <Header 
          userData={userData} 
          slug={slug} 
          onLogout={handleLogout} 
        />
        
        <main className="dashboard-content">
          {isExactHome ? (
            <div className="page-container">
              <div className="page-header">
                <div>
                  <h1 className="page-title">Dashboard Overview</h1>
                  <p className="page-subtitle">Monitor and manage all activities in your organization.</p>
                </div>
                <div className="header-actions">
                  <button className="action-btn secondary"><i className="fa-solid fa-rotate-right"></i> Refresh</button>
                  <button className="action-btn"><i className="fa-solid fa-plus"></i> New Record</button>
                </div>
              </div>
              
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper blue">
                    <i className="fa-regular fa-building"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{tenantStats ? tenantStats.total_employees : '--'}</span>
                    <span className="stat-title">Total Employees</span>
                    <span className="stat-trend up"><i className="fa-solid fa-user"></i> Live Count</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper green">
                    <i className="fa-regular fa-circle-check"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{tenantStats ? tenantStats.total_tasks : '--'}</span>
                    <span className="stat-title">Total Tasks ({tenantStats ? tenantStats.completed_tasks : 0} Done)</span>
                    <span className="stat-trend neutral"><i className="fa-solid fa-list-check"></i> Scrum Board</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper purple">
                    <i className="fa-solid fa-calendar-minus"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{tenantStats ? tenantStats.pending_leaves : '--'}</span>
                    <span className="stat-title">Pending Leave Requests</span>
                    <span className="stat-trend up"><i className="fa-solid fa-clock"></i> Needs Approval</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper orange">
                    <i className="fa-solid fa-user-check"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{tenantStats ? tenantStats.present_today : '--'}</span>
                    <span className="stat-title">Present Today</span>
                    <span className="stat-trend up"><i className="fa-solid fa-check"></i> Checked In</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <div className="card-icon"><i className="fa-regular fa-building"></i></div>
                    Recent Activity <span className="count-badge">3 of 12</span>
                  </h3>
                  <div className="header-actions">
                    <div className="search-input-wrapper">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input type="text" placeholder="Search activities..." />
                    </div>
                    <button className="action-btn secondary"><i className="fa-solid fa-filter"></i> Filter</button>
                  </div>
                </div>

                <div className="table-container">
                  <table className="static-table">
                    <thead>
                      <tr>
                        <th>Activity <i className="fa-solid fa-sort"></i></th>
                        <th>Type <i className="fa-solid fa-sort"></i></th>
                        <th>Status <i className="fa-solid fa-sort"></i></th>
                        <th>Date <i className="fa-solid fa-sort"></i></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingActivities ? (
                        <tr><td colSpan="6" style={{textAlign: 'center'}}>Loading activities...</td></tr>
                      ) : recentActivities.length === 0 ? (
                        <tr><td colSpan="6" style={{textAlign: 'center'}}>No recent activities.</td></tr>
                      ) : (
                        recentActivities.map(activity => (
                          <tr key={activity.id}>
                            <td>
                              <div className="flex-cell">
                                <div className="row-icon blue">
                                  {activity.employee_name ? activity.employee_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div className="cell-primary">{activity.employee_name}</div>
                                  <div style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>
                                    ID: {activity.employee_id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td><span className="badge primary">{activity.activity_type}</span></td>
                            <td>
                              <span className={`badge ${
                                activity.status === 'Approved' ? 'success' : 
                                activity.status === 'Rejected' ? 'danger' : 'warning'
                              }`}>
                                {activity.status}
                              </span>
                            </td>
                            <td>{new Date(activity.created_at).toLocaleDateString()}</td>
                            
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <Outlet context={{ role: userRole, slug, userData, isWorking, refreshAttendance: () => fetchTodayAttendance(userData) }} />
          )}
        </main>
      </div>
    </div>
  );
}

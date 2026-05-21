import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import HRMSAuth from './Pages/Auth/HRMSAuth';
import TenantVerification from './Pages/TenantVerification';
import Home from './Pages/Home/Home';
import OrgNotFound from './Pages/OrgNotFound';

// Admin Features
import EmployeeManagement from './Pages/Dashboard/Admin/EmployeeManagement';
import EmployeeAttendance from './Pages/Dashboard/Admin/EmployeeAttendance';
import PayrollManagement from './Pages/Dashboard/Admin/PayrollManagement';
import RecruitmentManagement from './Pages/Dashboard/Admin/RecruitmentManagement';
import RolePermissionControl from './Pages/Dashboard/Admin/RolePermissionControl';
import ReportsAnalytics from './Pages/Dashboard/Admin/ReportsAnalytics';

// Manager Features
import TeamManagement from './Pages/Dashboard/Manager/TeamManagement';
import AttendanceMonitoring from './Pages/Dashboard/Manager/AttendanceMonitoring';
import LeaveApproval from './Pages/Dashboard/Manager/LeaveApproval';
import PerformanceReview from './Pages/Dashboard/Manager/PerformanceReview';
import TaskAssignment from './Pages/Dashboard/Manager/TaskAssignment';

// Employee Features
import ProfileManagement from './Pages/Dashboard/Employee/ProfileManagement';
import AttendanceMarking from './Pages/Dashboard/Employee/AttendanceMarking';
import LeaveRequest from './Pages/Dashboard/Employee/LeaveRequest';
import PayslipAccess from './Pages/Dashboard/Employee/PayslipAccess';
import TaskAssignments from './Pages/Dashboard/Employee/TaskAssignments';

function App() {

  return (
    <Router>
      <Routes>
        {/* Root route - redirect to default tenant */}
        <Route path="/" element={<Navigate to="/appzoo/auth" replace />} />
        
        {/* Tenant slug verification wrapper */}
        <Route path="/:slug" element={<TenantVerification />}>
          {/* Auth routes */}
          <Route path="auth" element={<HRMSAuth />} />
          
          {/* Home route acts as the Dashboard Layout */}
          <Route path="home" element={<Home />}>
            {/* Admin Routes */}
            <Route path="admin/employees" element={<EmployeeManagement />} />
            <Route path="admin/attendance" element={<EmployeeAttendance />} />
            <Route path="admin/payroll" element={<PayrollManagement />} />
            <Route path="admin/recruitment" element={<RecruitmentManagement />} />
            <Route path="admin/roles" element={<RolePermissionControl />} />
            <Route path="admin/reports" element={<ReportsAnalytics />} />

            {/* Manager Routes */}
            <Route path="manager/team" element={<TeamManagement />} />
            <Route path="manager/attendance" element={<AttendanceMonitoring />} />
            <Route path="manager/leaves" element={<LeaveApproval />} />
            <Route path="manager/performance" element={<PerformanceReview />} />
            <Route path="manager/tasks" element={<TaskAssignment />} />

            {/* Employee Routes */}
            <Route path="employee/profile" element={<ProfileManagement />} />
            <Route path="employee/attendance" element={<AttendanceMarking />} />
            <Route path="employee/leaves" element={<LeaveRequest />} />
            <Route path="employee/payslips" element={<PayslipAccess />} />
            <Route path="employee/tasks" element={<TaskAssignments />} />
          </Route>
        </Route>
        
        {/* Not found page */}
        <Route path="/not-found" element={<OrgNotFound />} />
      </Routes>
    </Router>
  )
}

export default App

/**
 * API Configuration
 * Base URL and endpoint definitions
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

export const API_ENDPOINTS = {
  // Tenant endpoints
  TENANT_GET: (slug) => `${API_BASE_URL}/tenant/get/${slug}`,

  // Tenant User endpoints
  TENANT_USER_SIGNIN: `${API_BASE_URL}/tenant/user/signin`,
  TENANT_USER_SIGNUP: `${API_BASE_URL}/tenant/user/signup`,
  TENANT_USERS_BY_TENANT: (tenantId) => `${API_BASE_URL}/tenant/user/tenant/${tenantId}`,

  // Employee endpoints
  EMPLOYEE_LIST: `${API_BASE_URL}/tenant/employee/list`,
  EMPLOYEE_CREATE: `${API_BASE_URL}/tenant/employee/create`,
  EMPLOYEE_UPDATE: (id) => `${API_BASE_URL}/tenant/employee/edit/${id}`,
  EMPLOYEE_DELETE: (id) => `${API_BASE_URL}/tenant/employee/delete/${id}`,

  ATTENDANCE_LIST: `${API_BASE_URL}/tenant/attendance/`,
  ATTENDANCE_DETAIL: (id) => `${API_BASE_URL}/tenant/attendance/${id}`,
  ATTENDANCE_CHECKIN: `${API_BASE_URL}/tenant/attendance/checkin`,
  ATTENDANCE_CHECKOUT: `${API_BASE_URL}/tenant/attendance/checkout`,

  // Leave endpoints
  LEAVE_REQUEST: `${API_BASE_URL}/tenant/leave/requests`,

  // Salary endpoints
  SALARY_CALCULATE: `${API_BASE_URL}/tenant/salary/calculate`,
  SALARY_LIST: `${API_BASE_URL}/tenant/salary/list`,
  SALARY_PAY: (id) => `${API_BASE_URL}/tenant/salary/pay/${id}`,
  SALARY_CANCEL: (id) => `${API_BASE_URL}/tenant/salary/cancel/${id}`,
  SALARY_DELETE: (id) => `${API_BASE_URL}/tenant/salary/delete/${id}`,

  // Activity Log endpoints
  ACTIVITY_LOG: `${API_BASE_URL}/tenant/activities/logs/`,

  // Tenant Stats endpoint
  TENANT_STATS: `${API_BASE_URL}/tenant/stats/`,

  // Task / Scrum endpoints
  TASK_LIST: `${API_BASE_URL}/tenant/tasks/`,
  TASK_CREATE: `${API_BASE_URL}/tenant/tasks/`,
  TASK_UPDATE: (id) => `${API_BASE_URL}/tenant/tasks/${id}`,
  TASK_DELETE: (id) => `${API_BASE_URL}/tenant/tasks/${id}`,
};

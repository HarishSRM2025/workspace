/**
 * API Configuration
 * Base URL and endpoint definitions
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

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
  LEAVE_REQUEST: "http://localhost:8000/api/leave/requests/",

  // Salary endpoints
  SALARY_CALCULATE: `${API_BASE_URL}/tenant/salary/calculate`,
  SALARY_LIST: `${API_BASE_URL}/tenant/salary/list`,
  SALARY_PAY: (id) => `${API_BASE_URL}/tenant/salary/pay/${id}`,
  SALARY_CANCEL: (id) => `${API_BASE_URL}/tenant/salary/cancel/${id}`,
  SALARY_DELETE: (id) => `${API_BASE_URL}/tenant/salary/delete/${id}`,

  // Activity Log endpoints
  ACTIVITY_LOG: "http://localhost:8000/api/activities/logs/",
};

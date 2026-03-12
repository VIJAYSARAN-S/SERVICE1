const BASE_URL = 'http://127.0.0.1:8000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
}

export const endpoints = {
  login: '/login',
  verifyOtp: '/verify-otp',
  register: '/register',
  birthCertificate: '/services/birth-certificate',
  adminApplications: '/admin/applications',
  adminLoginLogs: '/admin/login-logs',
  adminAuditLogs: '/admin/audit-logs',
};

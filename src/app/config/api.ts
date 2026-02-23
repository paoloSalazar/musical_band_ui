// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Users
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    permissions: (id: string) => `/users/${id}/permissions`,
  },
  // Permissions
  permissions: {
    list: '/permissions',
    detail: (id: string) => `/permissions/${id}`,
    create: '/permissions',
    update: (id: string) => `/permissions/${id}`,
    delete: (id: string) => `/permissions/${id}`,
  },
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
} as const

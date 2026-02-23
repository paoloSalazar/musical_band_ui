import { API_CONFIG } from '@/app/config/api'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: RequestMethod
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options

  const url = `${API_CONFIG.baseURL}${endpoint}`
  
  const config: RequestInit = {
    method,
    headers: {
      ...API_CONFIG.headers,
      ...headers,
    },
    signal,
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  // Add authorization header if token exists
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.message || `API Error: ${response.status} ${response.statusText}`
    )
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}

export { ApiError }

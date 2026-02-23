import { api } from '@/app/services/api'
import { API_ENDPOINTS } from '@/app/config/api'
import type { LoginRequest, LoginResponse, User } from '@/app/types/auth'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(API_ENDPOINTS.auth.login, credentials)
    
    // Store token and user in localStorage
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    
    return response
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.auth.logout)
    } catch {
      // Ignore logout API errors
    } finally {
      // Always clear local storage
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem(USER_KEY)
    if (userStr) {
      return JSON.parse(userStr)
    }
    
    try {
      const user = await api.get<User>(API_ENDPOINTS.auth.me)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      return user
    } catch {
      return null
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}

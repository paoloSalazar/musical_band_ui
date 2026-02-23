import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authService } from '@/app/services/auth.service'
import type { User, LoginRequest, AuthState } from '@/app/types/auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: authService.getStoredUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: true,
  })

  useEffect(() => {
    // Check authentication status on mount
    const initAuth = async () => {
      if (state.token) {
        const user = await authService.getCurrentUser()
        setState({
          user,
          token: state.token,
          isAuthenticated: !!user,
          isLoading: false,
        })
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const response = await authService.login(credentials)
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    await authService.logout()
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

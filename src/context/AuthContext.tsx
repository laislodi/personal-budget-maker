import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function parseJwtExpiry(token: string): number | null {
  try {
    // JWT payload is base64url-encoded; atob needs standard base64
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const exp = parseJwtExpiry(token)
  return exp !== null && Date.now() / 1000 >= exp
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    setToken(null)
  }, [])

  // On mount: restore token only if it hasn't expired yet
  useEffect(() => {
    const stored = localStorage.getItem('access_token')
    if (!stored) return
    if (isTokenExpired(stored)) {
      localStorage.removeItem('access_token')
    } else {
      setToken(stored)
    }
  }, [])

  // Auto-logout when any API call gets a 401
  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  function login(newToken: string) {
    localStorage.setItem('access_token', newToken)
    setToken(newToken)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

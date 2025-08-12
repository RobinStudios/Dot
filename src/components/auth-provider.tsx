'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { sanitizeInput } from '@/lib/security/csrf'
import { toast } from '@/components/ui/toast'
import { LoadingSpinner } from '@/components/ui/loading'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        } else {
          localStorage.removeItem('auth_token')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const { user, token } = await response.json()
        localStorage.setItem('auth_token', token)
        setUser(user)
        toast.success(`Welcome back, ${user.name}!`)
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Login failed. Please check your credentials.')
      }
      return false
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.')
      return false
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      if (response.ok) {
        const { user, token } = await response.json()
        localStorage.setItem('auth_token', token)
        setUser(user)
        return true
      }
      return false
    } catch (error) {
      console.error('Signup failed:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, signup } = useAuth()

  // GitHub OAuth login handler (now in correct scope)
  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  // On mount, check for GitHub OAuth callback
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const isGitHubCallback = url.pathname.includes('/auth/github/callback');
    if (code && isGitHubCallback) {
      setIsLoading(true);
      fetch(`/api/auth/github/callback?code=${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.access_token && data.user) {
            localStorage.setItem('github_token', data.access_token);
            localStorage.setItem('github_user', JSON.stringify(data.user));
            window.history.replaceState({}, document.title, '/');
            onClose();
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = isLogin 
      ? await login(email, password)
      : await signup(email, password, name)

    if (success) {
      onClose()
      setEmail('')
      setPassword('')
      setName('')
    }
    setIsLoading(false)
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" style={{ background: 'var(--graphite-mist)', color: 'var(--cloud-white)' }}>
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(sanitizeInput(e.target.value))}
              className="w-full p-3 rounded-lg border"
              style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(sanitizeInput(e.target.value))}
            className="w-full p-3 rounded-lg border"
            style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border"
            style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={handleGitHubLogin}
            className="w-full bg-gray-900 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800"
            style={{ marginTop: '1rem' }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98.01 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/></svg>
            Continue with GitHub
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:underline"
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
    </div>
  )
}
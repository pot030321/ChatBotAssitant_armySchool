import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // If already logged in, go to appropriate dashboard based on role
    const token = localStorage.getItem('auth_token')
    if (token) {
      const userDataStr = localStorage.getItem('auth_user')
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)
          const userRole = userData.role || 'student'
          switch (userRole.toLowerCase()) {
            case 'manager':
              navigate('/manager', { replace: true })
              break
            case 'leadership':
              navigate('/leadership', { replace: true })
              break
            case 'department':
              navigate('/department', { replace: true })
              break
            case 'student':
            default:
              navigate('/student', { replace: true })
          }
        } catch (e) {
          // If there's an error parsing user data, redirect to student dashboard
          navigate('/student', { replace: true })
        }
      } else {
        navigate('/student', { replace: true })
      }
    }
  }, [navigate])

  const submit = useCallback(async () => {
    setError('')
    if (!username || !password) {
      setError('Nhập tài khoản và mật khẩu.')
      return
    }
    setLoading(true)
    try {
      const body = new URLSearchParams({ grant_type: 'password', username, password })
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = await res.json()
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      // Redirect based on user role
      const userRole = data.user.role || 'student'
      switch (userRole.toLowerCase()) {
        case 'manager':
          navigate('/manager', { replace: true })
          break
        case 'leadership':
          navigate('/leadership', { replace: true })
          break
        case 'department':
          navigate('/department', { replace: true })
          break
        case 'student':
        default:
          navigate('/student', { replace: true })
      }
    } catch (e) {
      console.error('Login failed', e)
      setError('Đăng nhập thất bại. Kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }, [username, password, navigate])

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Đăng nhập</h2>
        <input
          placeholder="Tài khoản"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e)=> e.key==='Enter' && submit()}
        />
        <button onClick={submit} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        {error && <div className="error" role="alert">{error}</div>}
      </div>
    </div>
  )
}

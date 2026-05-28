// SRP: handles only the login form UI and submission flow.
// DIP: depends on apiLogin (abstraction) and useAuth (abstraction), not fetch.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiLogin } from '../api/auth'
import { validateLoginForm, type LoginErrors } from '../utils/validation'
import { usePasswordVisibility } from '../hooks/usePasswordVisibility'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/FormField'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordVisibility = usePasswordVisibility()

  // Clear the field error as soon as the user edits it
  function clearError(field: keyof LoginErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')

    const fieldErrors = validateLoginForm(email, password)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const { access_token } = await apiLogin(email, password)
      login(access_token)
      navigate('/')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-icon">◈</span>
            Budget Maker
          </Link>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Log in to your account to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {apiError && (
            <div className="auth-api-error" role="alert">
              <span aria-hidden="true">⚠</span>
              {apiError}
            </div>
          )}

          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
            onChange={(v) => { setEmail(v); clearError('email') }}
          />

          <FormField
            id="password"
            label="Password"
            type={passwordVisibility.inputType}
            value={password}
            error={errors.password}
            placeholder="Your password"
            autoComplete="current-password"
            disabled={loading}
            onChange={(v) => { setPassword(v); clearError('password') }}
            suffix={
              <button type="button" onClick={passwordVisibility.toggle} tabIndex={-1}>
                {passwordVisibility.visible ? 'Hide' : 'Show'}
              </button>
            }
          />

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Sign up</Link>
        </p>

      </div>
    </div>
  )
}

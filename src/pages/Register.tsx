// SRP: handles only the registration form UI and submission flow.
// DIP: depends on apiRegister/apiLogin (abstractions) and useAuth, not fetch.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRegister, apiLogin } from '../api/auth'
import { validateRegisterForm, type RegisterErrors } from '../utils/validation'
import { usePasswordVisibility } from '../hooks/usePasswordVisibility'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/FormField'
import PasswordStrength from '../components/PasswordStrength'
import './Auth.css'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordVisibility = usePasswordVisibility()
  const confirmVisibility = usePasswordVisibility()

  function clearError(field: keyof RegisterErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')

    const fieldErrors = validateRegisterForm(name, email, password, confirmPassword)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      await apiRegister(name.trim(), email, password)
      // Auto-login immediately after registration
      const { access_token } = await apiLogin(email, password)
      login(access_token)
      navigate('/')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed')
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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start building your budget in minutes</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {apiError && (
            <div className="auth-api-error" role="alert">
              <span aria-hidden="true">⚠</span>
              {apiError}
            </div>
          )}

          <FormField
            id="name"
            label="Full name"
            type="text"
            value={name}
            error={errors.name}
            placeholder="Jane Smith"
            autoComplete="name"
            disabled={loading}
            onChange={(v) => { setName(v); clearError('name') }}
          />

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

          <div>
            <FormField
              id="password"
              label="Password"
              type={passwordVisibility.inputType}
              value={password}
              error={errors.password}
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={loading}
              onChange={(v) => { setPassword(v); clearError('password') }}
              suffix={
                <button type="button" onClick={passwordVisibility.toggle} tabIndex={-1}>
                  {passwordVisibility.visible ? 'Hide' : 'Show'}
                </button>
              }
            />
            <PasswordStrength password={password} />
          </div>

          <FormField
            id="confirmPassword"
            label="Confirm password"
            type={confirmVisibility.inputType}
            value={confirmPassword}
            error={errors.confirmPassword}
            placeholder="Repeat your password"
            autoComplete="new-password"
            disabled={loading}
            onChange={(v) => { setConfirmPassword(v); clearError('confirmPassword') }}
            suffix={
              <button type="button" onClick={confirmVisibility.toggle} tabIndex={-1}>
                {confirmVisibility.visible ? 'Hide' : 'Show'}
              </button>
            }
          />

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>

      </div>
    </div>
  )
}

// SRP: all validation logic is centralised here — no validation in components.
// OCP: password rules are a data array. Add or remove a rule without touching
//      any component or any other validation function.

export interface ValidationRule {
  label: string
  test: (value: string) => boolean
}

// Each rule is a plain data object — easy to extend, easy to test.
export const passwordRules: ValidationRule[] = [
  {
    label: 'At least 8 characters',
    test: (v) => v.length >= 8,
  },
  {
    label: 'One uppercase letter (A–Z)',
    test: (v) => /[A-Z]/.test(v),
  },
  {
    label: 'One lowercase letter (a–z)',
    test: (v) => /[a-z]/.test(v),
  },
  {
    label: 'One number (0–9)',
    test: (v) => /[0-9]/.test(v),
  },
  {
    label: 'One special character (_ ! @ # $ % ^ & * etc.)',
    test: (v) => /[_!@#$%^&*()[\]{}\\|~\-+=]/.test(v),
  },
]

export function validatePassword(password: string): string | null {
  const failed = passwordRules.find((rule) => !rule.test(password))
  return failed ? `Password must contain: ${failed.label.toLowerCase()}` : null
}

export function validateEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? null
    : 'Please enter a valid email address'
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  return value.trim().length >= min
    ? null
    : `${fieldName} must be at least ${min} characters`
}

export function validatePasswordMatch(password: string, confirm: string): string | null {
  return password === confirm ? null : 'Passwords do not match'
}

// --- Form-level validators (ISP: each form gets exactly what it needs) ---

export interface LoginErrors {
  email?: string
  password?: string
}

export function validateLoginForm(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {}
  const emailErr = validateEmail(email)
  if (emailErr) errors.email = emailErr
  if (!password) errors.password = 'Password is required'
  return errors
}

export interface RegisterErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): RegisterErrors {
  const errors: RegisterErrors = {}
  const nameErr = validateMinLength(name.trim(), 2, 'Name')
  if (nameErr) errors.name = nameErr
  const emailErr = validateEmail(email)
  if (emailErr) errors.email = emailErr
  const passwordErr = validatePassword(password)
  if (passwordErr) errors.password = passwordErr
  const confirmErr = validatePasswordMatch(password, confirmPassword)
  if (confirmErr) errors.confirmPassword = confirmErr
  return errors
}

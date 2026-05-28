// SRP: renders one labeled form field with an optional error and an optional
//      suffix slot (used for the show/hide password button).
//      Knows nothing about validation rules or API calls.
import type { ReactNode } from 'react'
import './FormField.css'

interface FormFieldProps {
  id: string
  label: string
  type: string
  value: string
  error?: string
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  onChange: (value: string) => void
  onBlur?: () => void
  suffix?: ReactNode
}

export default function FormField({
  id,
  label,
  type,
  value,
  error,
  placeholder,
  autoComplete,
  disabled,
  onChange,
  onBlur,
  suffix,
}: FormFieldProps) {
  return (
    <div className={`form-field${error ? ' form-field--error' : ''}`}>
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      <div className="form-field__input-wrap">
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="form-field__input"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        {suffix && <div className="form-field__suffix">{suffix}</div>}
      </div>
      {error && (
        <span id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

// SRP: renders the live pass/fail state of each password rule.
//      Reads rules from validation.ts — it never defines them itself (DIP).
import { passwordRules } from '../utils/validation'
import './PasswordStrength.css'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  return (
    <ul className="pw-strength" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const passed = rule.test(password)
        return (
          <li
            key={rule.label}
            className={`pw-strength__rule${passed ? ' pw-strength__rule--pass' : ''}`}
          >
            <span className="pw-strength__icon" aria-hidden="true">
              {passed ? '✓' : '○'}
            </span>
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

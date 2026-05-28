// SRP: encapsulates only the show/hide toggle for a password field.
import { useState } from 'react'

export function usePasswordVisibility() {
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible((v) => !v)
  const inputType = visible ? 'text' : 'password'
  return { visible, toggle, inputType }
}

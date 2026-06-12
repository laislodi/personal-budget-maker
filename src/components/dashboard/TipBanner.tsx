import { useState, useEffect } from 'react'
import './TipBanner.css'

interface TipBannerProps {
  id: string
  children: React.ReactNode
}

export default function TipBanner({ id, children }: TipBannerProps) {
  const storageKey = `tip_dismissed_${id}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey) === 'true'
    setVisible(!dismissed)
  }, [storageKey])

  function dismiss() {
    localStorage.setItem(storageKey, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="tip-banner" role="note">
      <span className="tip-banner__icon">💡</span>
      <p className="tip-banner__text">{children}</p>
      <button className="tip-banner__close" onClick={dismiss} aria-label="Dismiss tip">×</button>
    </div>
  )
}

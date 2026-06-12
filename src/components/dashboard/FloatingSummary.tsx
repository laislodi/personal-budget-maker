import type { BudgetReport } from '../../api/budget'
import './FloatingSummary.css'

interface FloatingSummaryProps {
  report: BudgetReport | null
  visible: boolean
}

function fmt(value: string | number) {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function FloatingSummary({ report, visible }: FloatingSummaryProps) {
  const income   = report ? parseFloat(report.total_income)   : 0
  const expenses = report ? parseFloat(report.total_expenses) : 0
  const net      = report ? parseFloat(report.net)            : 0

  const isDeficit  = net < -0.5
  const isBalanced = Math.abs(net) < 0.5

  return (
    <div className={`floating-summary ${visible ? 'is-visible' : ''}`} role="status" aria-live="polite">
      <div className="floating-summary__item floating-summary__item--income">
        <span className="floating-summary__label">Income</span>
        <span className="floating-summary__value">{fmt(income)}</span>
      </div>

      <div className="floating-summary__sep" aria-hidden="true" />

      <div className="floating-summary__item floating-summary__item--expense">
        <span className="floating-summary__label">Expenses</span>
        <span className="floating-summary__value">{fmt(expenses)}</span>
      </div>

      <div className="floating-summary__sep" aria-hidden="true" />

      <div className={`floating-summary__item floating-summary__item--net ${isDeficit ? 'is-deficit' : isBalanced ? 'is-zero' : 'is-surplus'}`}>
        <span className="floating-summary__label">
          {isDeficit ? 'Over budget' : isBalanced ? 'Balanced ✓' : 'Left to assign'}
        </span>
        <span className="floating-summary__value">{isBalanced ? '—' : fmt(Math.abs(net))}</span>
      </div>
    </div>
  )
}

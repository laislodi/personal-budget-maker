import type { BudgetReport } from '../../api/budget'
import './BudgetSummary.css'

interface BudgetSummaryProps {
  report: BudgetReport | null
  loading: boolean
}

function fmt(value: string | number) {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function getDynamicTip(report: BudgetReport | null): { text: string; variant: 'neutral' | 'success' | 'warning' | 'danger' } {
  if (!report) return { text: 'Loading your budget summary…', variant: 'neutral' }

  const income = parseFloat(report.total_income)
  const expenses = parseFloat(report.total_expenses)
  const net = parseFloat(report.net)

  if (income === 0 && expenses === 0)
    return { text: 'Start here — add your take-home pay first.', variant: 'neutral' }
  if (income > 0 && expenses === 0)
    return { text: 'Good start. Now add your expenses category by category.', variant: 'neutral' }
  if (Math.abs(net) < 1)
    return { text: 'Budget complete — every dollar has a job. Well done!', variant: 'success' }
  if (net > 0)
    return {
      text: `You have ${fmt(net)} left to assign. Consider savings, an emergency fund, or a goal.`,
      variant: 'warning',
    }
  return {
    text: `You're ${fmt(Math.abs(net))} over budget. Review your expenses to find room.`,
    variant: 'danger',
  }
}

export default function BudgetSummary({ report, loading }: BudgetSummaryProps) {
  const income   = report ? parseFloat(report.total_income)   : 0
  const expenses = report ? parseFloat(report.total_expenses) : 0
  const net      = report ? parseFloat(report.net)            : 0

  const pct = income > 0 ? Math.min(100, (expenses / income) * 100) : 0
  const tip = getDynamicTip(report)

  return (
    <div className="budget-summary">
      <div className="budget-summary__stats">
        <div className="budget-summary__stat budget-summary__stat--income">
          <span className="budget-summary__label">Income</span>
          <span className="budget-summary__value">{loading ? '—' : fmt(income)}</span>
        </div>
        <div className="budget-summary__divider" aria-hidden="true">–</div>
        <div className="budget-summary__stat budget-summary__stat--expense">
          <span className="budget-summary__label">Expenses</span>
          <span className="budget-summary__value">{loading ? '—' : fmt(expenses)}</span>
        </div>
        <div className="budget-summary__divider" aria-hidden="true">=</div>
        <div className={`budget-summary__stat budget-summary__stat--net ${net < -0.5 ? 'is-deficit' : net < 0.5 ? 'is-zero' : 'is-surplus'}`}>
          <span className="budget-summary__label">{net < -0.5 ? 'Over budget' : net < 0.5 ? 'Balanced' : 'Left to assign'}</span>
          <span className="budget-summary__value">{loading ? '—' : fmt(Math.abs(net))}</span>
        </div>
      </div>

      <div className="budget-summary__progress-wrap" aria-label={`${Math.round(pct)}% of income allocated`}>
        <div className="budget-summary__progress-track">
          <div
            className={`budget-summary__progress-fill ${pct > 100 ? 'is-over' : ''}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="budget-summary__progress-label">{Math.round(pct)}% allocated</span>
      </div>

      <div className={`budget-summary__tip budget-summary__tip--${tip.variant}`}>
        <span className="budget-summary__tip-icon">
          {tip.variant === 'success' ? '✅' : tip.variant === 'danger' ? '⚠️' : tip.variant === 'warning' ? '⚡' : 'ℹ️'}
        </span>
        <span>{tip.text}</span>
      </div>
    </div>
  )
}

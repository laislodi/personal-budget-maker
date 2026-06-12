import { useState } from 'react'
import type { IncomeSource, Frequency, IncomeType, ReportIncomeEntry } from '../../api/budget'
import TipBanner from './TipBanner'
import './IncomeSection.css'

const FREQUENCY_LABELS: Record<Frequency, string> = {
  MONTHLY:  'Monthly',
  WEEKLY:   'Weekly',
  BIWEEKLY: 'Biweekly',
  DAILY:    'Daily',
  ONCE:     'One Time',
}

const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  WAGES:              'Wages / Salary',
  INTEREST_DIVIDEND:  'Interest / Dividend',
  SIDE_HUSTLE:        'Side hustle',
  MISCELLANEOUS:      'Miscellaneous',
}

function fmt(value: string | number) {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

interface IncomeSectionProps {
  sources: IncomeSource[]
  reportEntries: ReportIncomeEntry[]
  budgetId: string
  onAddSource: (data: { name: string; type: IncomeType; amount: number; frequency: Frequency; reference_date: string }) => Promise<void>
  onSetEntry: (sourceId: string, amount: number) => Promise<void>
  onRemoveEntry: (sourceId: string) => Promise<void>
  loading: boolean
}

interface AddFormState {
  name: string
  type: IncomeType
  amount: string
  frequency: Frequency
}

const DEFAULT_FORM: AddFormState = {
  name: '',
  type: 'WAGES',
  amount: '',
  frequency: 'MONTHLY',
}

export default function IncomeSection({
  sources,
  reportEntries,
  onAddSource,
  onSetEntry,
  onRemoveEntry,
  loading,
}: IncomeSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddFormState>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Map source id → monthly equivalent from the report
  const entryMap = new Map(reportEntries.map(e => [e.income_source_id, e]))

  const totalMonthly = reportEntries.reduce((sum, e) => sum + parseFloat(e.monthly_equivalent), 0)

  async function handleAdd(ev: React.FormEvent) {
    ev.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.name.trim() || isNaN(amount) || amount <= 0) {
      setError('Please enter a name and a valid amount.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onAddSource({
        name: form.name.trim(),
        type: form.type,
        amount,
        frequency: form.frequency,
        reference_date: new Date().toISOString().slice(0, 10),
      })
      setForm(DEFAULT_FORM)
      setShowForm(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add income source.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleEntry(source: IncomeSource) {
    const existing = entryMap.get(source.id)
    if (existing) {
      await onRemoveEntry(source.id)
    } else {
      await onSetEntry(source.id, parseFloat(source.amount))
    }
  }

  return (
    <section className="income-section">
      <div className="dash-section__header">
        <h2 className="dash-section__title">
          <span className="dash-section__icon">💰</span>
          Income
          <span className="dash-section__badge">ins</span>
        </h2>
        {totalMonthly > 0 && (
          <span className="dash-section__total income-total">{fmt(totalMonthly)} / mo</span>
        )}
      </div>

      <TipBanner id="income-section">
        Add every source of money coming in — salary, side gigs, dividends — using the
        frequency that matches how you're paid. For annual income (e.g. a bonus), divide by
        12 and enter as Monthly.
      </TipBanner>

      {loading && <p className="dash-section__loading">Loading…</p>}

      {!loading && sources.length === 0 && !showForm && (
        <p className="dash-section__empty">
          No income sources yet. Add your first one below to get started.
        </p>
      )}

      {sources.length > 0 && (
        <ul className="income-list">
          {sources.map(source => {
            const entry = entryMap.get(source.id)
            const included = !!entry
            return (
              <li key={source.id} className={`income-row ${included ? 'is-included' : 'is-excluded'}`}>
                <div className="income-row__info">
                  <span className="income-row__name">{source.name}</span>
                  <span className="income-row__meta">
                    {INCOME_TYPE_LABELS[source.type]} · {FREQUENCY_LABELS[source.frequency]}
                  </span>
                </div>
                <div className="income-row__right">
                  {included && entry && (
                    <span className="income-row__monthly">
                      {fmt(parseFloat(entry.monthly_equivalent))} / mo
                    </span>
                  )}
                  <span className="income-row__amount">{fmt(source.amount)}</span>
                  <button
                    className={`income-row__toggle btn ${included ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => handleToggleEntry(source)}
                  >
                    {included ? 'Remove' : 'Include'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {sources.length > 0 && reportEntries.length > 0 && (
        <div className="income-total-row">
          <span>Monthly total</span>
          <span className="income-total-value">{fmt(totalMonthly)}</span>
        </div>
      )}

      {showForm ? (
        <form className="add-entry-form" onSubmit={handleAdd} noValidate>
          <h3 className="add-entry-form__title">New income source</h3>

          <div className="add-entry-form__row">
            <div className="add-entry-form__field">
              <label htmlFor="inc-name">Name</label>
              <input
                id="inc-name"
                type="text"
                placeholder="e.g. Salary, Freelance"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="add-entry-form__field add-entry-form__field--sm">
              <label htmlFor="inc-type">Type</label>
              <select
                id="inc-type"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as IncomeType }))}
              >
                {(Object.entries(INCOME_TYPE_LABELS) as [IncomeType, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="add-entry-form__row">
            <div className="add-entry-form__field">
              <label htmlFor="inc-amount">Amount ($)</label>
              <input
                id="inc-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>

            <div className="add-entry-form__field add-entry-form__field--sm">
              <label htmlFor="inc-freq">Frequency</label>
              <select
                id="inc-freq"
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Frequency }))}
              >
                {(Object.entries(FREQUENCY_LABELS) as [Frequency, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.frequency !== 'MONTHLY' && form.amount && !isNaN(parseFloat(form.amount)) && (
            <p className="add-entry-form__hint">
              ≈ {fmt(
                form.frequency === 'WEEKLY'   ? parseFloat(form.amount) * (52 / 12) :
                form.frequency === 'BIWEEKLY' ? parseFloat(form.amount) * (26 / 12) :
                parseFloat(form.amount) * 30
              )} / month
            </p>
          )}

          {error && <p className="add-entry-form__error" role="alert">{error}</p>}

          <div className="add-entry-form__actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Adding…' : 'Add income source'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setError(null); setForm(DEFAULT_FORM) }}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="add-entry-btn" onClick={() => setShowForm(true)}>
          + Add income source
        </button>
      )}
    </section>
  )
}

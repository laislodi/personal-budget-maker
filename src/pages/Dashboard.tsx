import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BudgetSummary from '../components/dashboard/BudgetSummary'
import FloatingSummary from '../components/dashboard/FloatingSummary'
import IncomeSection from '../components/dashboard/IncomeSection'
import ExpenseSection from '../components/dashboard/ExpenseSection'
import {
  getBudgets,
  createBudget,
  getIncomeSources,
  createIncomeSource,
  getCategories,
  createCategory,
  createItem,
  resetDefaultItems,
  getBudgetReport,
  upsertBudgetIncome,
  deleteBudgetIncome,
  upsertBudgetExpense,
  deleteBudgetExpense,
  type Budget,
  type IncomeSource,
  type Category,
  type BudgetReport,
  type IncomeType,
  type Frequency,
} from '../api/budget'
import './Dashboard.css'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function firstDayOfMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

function lastDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 0) // day 0 of next month = last day of this month
  return `${year}-${String(month).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function findBudgetForMonth(budgets: Budget[], year: number, month: number): Budget | undefined {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return budgets.find(b => b.period_start.startsWith(prefix))
}

// ── useDashboard hook ──────────────────────────────────────────────────────

function useDashboard(token: string, year: number, month: number) {
  const [budget, setBudget]         = useState<Budget | null>(null)
  const [sources, setSources]       = useState<IncomeSource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [report, setReport]         = useState<BudgetReport | null>(null)

  const [loadingBudget, setLoadingBudget]     = useState(true)
  const [loadingIncome, setLoadingIncome]     = useState(false)
  const [loadingExpenses, setLoadingExpenses] = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [creatingBudget, setCreatingBudget]   = useState(false)

  const refreshReport = useCallback(async (budgetId: string) => {
    try {
      const r = await getBudgetReport(token, budgetId)
      setReport(r)
    } catch {
      // report fetch failure is non-fatal — totals just won't update
    }
  }, [token])

  // Load all budgets once; find the right one whenever year/month changes
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingBudget(true)
      setError(null)
      try {
        const all = await getBudgets(token)
        if (cancelled) return
        const found = findBudgetForMonth(all, year, month)
        setBudget(found ?? null)
        setReport(null)
        if (found) await refreshReport(found.id)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load budgets.')
      } finally {
        if (!cancelled) setLoadingBudget(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token, year, month, refreshReport])

  // Load income sources and categories (global, loaded once per session)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingIncome(true)
      setLoadingExpenses(true)
      try {
        const [src, cats] = await Promise.all([getIncomeSources(token), getCategories(token)])
        if (!cancelled) {
          setSources(src)
          setCategories(cats)
        }
      } catch {
        // non-fatal
      } finally {
        if (!cancelled) { setLoadingIncome(false); setLoadingExpenses(false) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  async function handleCreateBudget() {
    setCreatingBudget(true)
    try {
      const name = `${MONTH_NAMES[month - 1]} ${year}`
      const b = await createBudget(token, {
        name,
        period_type: 'MONTHLY',
        period_start: firstDayOfMonth(year, month),
        period_end: lastDayOfMonth(year, month),
      })
      setBudget(b)
      await refreshReport(b.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create budget.')
    } finally {
      setCreatingBudget(false)
    }
  }

  async function handleAddSource(data: { name: string; type: IncomeType; amount: number; frequency: Frequency; reference_date: string }) {
    const src = await createIncomeSource(token, data)
    setSources(prev => [...prev, src])
    // Automatically include the new source in the current budget if one exists
    if (budget) {
      await upsertBudgetIncome(token, budget.id, src.id, { amount: data.amount })
      await refreshReport(budget.id)
    }
  }

  async function handleSetEntry(sourceId: string, amount: number) {
    if (!budget) return
    await upsertBudgetIncome(token, budget.id, sourceId, { amount })
    await refreshReport(budget.id)
  }

  async function handleRemoveEntry(sourceId: string) {
    if (!budget) return
    await deleteBudgetIncome(token, budget.id, sourceId)
    await refreshReport(budget.id)
  }

  async function handleSetExpense(itemId: string, amount: number) {
    if (!budget) return
    await upsertBudgetExpense(token, budget.id, itemId, { amount })
    await refreshReport(budget.id)
  }

  async function handleRemoveExpense(itemId: string) {
    if (!budget) return
    await deleteBudgetExpense(token, budget.id, itemId)
    await refreshReport(budget.id)
  }

  async function handleAddCategory(name: string) {
    const cat = await createCategory(token, { name })
    setCategories(prev => [...prev, cat])
  }

  async function handleAddItem(categoryId: string, name: string) {
    const item = await createItem(token, categoryId, { name })
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, items: [...c.items, item] } : c
    ))
  }

  async function handleResetDefaults() {
    await resetDefaultItems(token)
    const cats = await getCategories(token)
    setCategories(cats)
    if (budget) await refreshReport(budget.id)
  }

  return {
    budget,
    sources,
    categories,
    report,
    loadingBudget,
    loadingIncome,
    loadingExpenses,
    error,
    creatingBudget,
    actions: {
      createBudget: handleCreateBudget,
      addSource: handleAddSource,
      setEntry: handleSetEntry,
      removeEntry: handleRemoveEntry,
      setExpense: handleSetExpense,
      removeExpense: handleRemoveExpense,
      addCategory: handleAddCategory,
      addItem: handleAddItem,
      resetDefaults: handleResetDefaults,
    },
  }
}

// ── Dashboard page ────────────────────────────────────────────────────────

export default function Dashboard() {
  const { isLoggedIn, token } = useAuth()
  const navigate = useNavigate()

  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const summaryRef = useRef<HTMLDivElement>(null)
  const [floatingVisible, setFloatingVisible] = useState(false)

  useEffect(() => {
    const el = summaryRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setFloatingVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [summaryRef.current]) // re-attach if the element mounts after budget is created

  useEffect(() => {
    if (!isLoggedIn) navigate('/login', { replace: true })
  }, [isLoggedIn, navigate])

  const {
    budget,
    sources,
    categories,
    report,
    loadingBudget,
    loadingIncome,
    loadingExpenses,
    error,
    creatingBudget,
    actions,
  } = useDashboard(token ?? '', year, month)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  if (!isLoggedIn) return null

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`

  return (
    <div className="dashboard">
      <div className="container">

        {/* ── Header ── */}
        <header className="dashboard__header">
          <div className="dashboard__month-nav">
            <button className="dashboard__nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
            <h1 className="dashboard__month-label">{monthLabel}</h1>
            <button className="dashboard__nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
          </div>
          <p className="dashboard__subtitle">Monthly budget</p>
        </header>

        {error && (
          <div className="dashboard__error" role="alert">
            {error}
          </div>
        )}

        {/* ── No budget for this month ── */}
        {!loadingBudget && !budget && (
          <div className="dashboard__no-budget">
            <span className="dashboard__no-budget-icon">📋</span>
            <h2>No budget for {monthLabel} yet</h2>
            <p>Create one to start planning where your money goes this month.</p>
            <button
              className="btn btn-primary btn-lg"
              onClick={actions.createBudget}
              disabled={creatingBudget}
            >
              {creatingBudget ? 'Creating…' : `Create ${monthLabel} budget`}
            </button>
            <p className="dashboard__no-budget-hint">
              You can navigate to any month using the arrows above.
            </p>
          </div>
        )}

        {/* ── Budget content ── */}
        {budget && (
          <>
            <div ref={summaryRef}>
              <BudgetSummary report={report} loading={loadingBudget} />
            </div>

            <div className="dashboard__columns">
              <IncomeSection
                sources={sources}
                reportEntries={report?.income_entries ?? []}
                budgetId={budget.id}
                onAddSource={actions.addSource}
                onSetEntry={actions.setEntry}
                onRemoveEntry={actions.removeEntry}
                loading={loadingIncome}
              />
              <ExpenseSection
                categories={categories}
                reportCategories={report?.categories ?? []}
                onSetExpense={actions.setExpense}
                onRemoveExpense={actions.removeExpense}
                onAddCategory={actions.addCategory}
                onAddItem={actions.addItem}
                onResetDefaults={actions.resetDefaults}
                loading={loadingExpenses}
              />
            </div>
          </>
        )}

        {loadingBudget && (
          <div className="dashboard__skeleton">
            <div className="skeleton-bar skeleton-bar--tall" />
            <div className="dashboard__columns">
              <div className="skeleton-bar" />
              <div className="skeleton-bar" />
            </div>
          </div>
        )}

      </div>

      <FloatingSummary report={report} visible={floatingVisible && !!budget} />
    </div>
  )
}

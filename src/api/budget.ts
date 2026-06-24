import { ApiError } from './errors'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'))
    throw new ApiError('Session expired. Please log in again.', 401)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError((body as { detail?: string }).detail ?? 'Something went wrong', res.status)
  }
  return res.json() as Promise<T>
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

// ── Types ──────────────────────────────────────────────────────────────────

export type Frequency  = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ONCE'
export type IncomeType = 'WAGES' | 'INTEREST_DIVIDEND' | 'SIDE_HUSTLE' | 'MISCELLANEOUS'

export interface IncomeSource {
  id: string
  name: string
  type: IncomeType
  amount: string
  frequency: Frequency
  reference_date: string
  is_fixed: boolean
  is_active: boolean
}

export interface Item {
  id: string
  name: string
  display_order: number
  is_default: boolean
  is_hidden: boolean
  category_id: string
}

export interface Category {
  id: string
  name: string
  display_order: number
  is_default: boolean
  items: Item[]
}

export interface Budget {
  id: string
  name: string
  period_type: Frequency
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface BudgetIncomeEntry {
  income_source_id: string
  name: string
  type: IncomeType
  amount: string
  notes: string | null
}

export interface BudgetExpenseEntry {
  expense_item_id: string
  name: string
  amount: string
  is_fixed: boolean | null
  notes: string | null
}

export interface ReportIncomeEntry {
  income_source_id: string
  name: string
  type: IncomeType
  amount: string
  frequency: Frequency
  monthly_equivalent: string
  notes: string | null
}

export interface ReportExpenseItem {
  expense_item_id: string
  name: string
  amount: string
  is_fixed: boolean | null
  notes: string | null
}

export interface ReportCategorySummary {
  category_id: string
  category_name: string
  total: string
  items: ReportExpenseItem[]
}

export interface BudgetReport {
  budget_id: string
  budget_name: string
  period_type: Frequency
  period_start: string
  period_end: string
  total_income: string
  total_expenses: string
  net: string
  income_entries: ReportIncomeEntry[]
  categories: ReportCategorySummary[]
}

// ── Income Sources ─────────────────────────────────────────────────────────

export async function getIncomeSources(token: string): Promise<IncomeSource[]> {
  const res = await fetch(`${API_BASE}/income-sources`, { headers: authHeaders(token) })
  return handleResponse<IncomeSource[]>(res)
}

export async function createIncomeSource(
  token: string,
  data: { name: string; type: IncomeType; amount: number; frequency: Frequency; reference_date: string; is_fixed?: boolean },
): Promise<IncomeSource> {
  const res = await fetch(`${API_BASE}/income-sources`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<IncomeSource>(res)
}

export async function updateIncomeSource(
  token: string,
  id: string,
  data: Partial<{ name: string; amount: number; frequency: Frequency; reference_date: string; is_fixed: boolean; is_active: boolean }>,
): Promise<IncomeSource> {
  const res = await fetch(`${API_BASE}/income-sources/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<IncomeSource>(res)
}

export async function deleteIncomeSource(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/income-sources/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return handleResponse<void>(res)
}

// ── Categories & Items ─────────────────────────────────────────────────────

export async function getCategories(token: string): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, { headers: authHeaders(token) })
  return handleResponse<Category[]>(res)
}

export async function createCategory(
  token: string,
  data: { name: string; display_order?: number },
): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Category>(res)
}

export async function createItem(
  token: string,
  categoryId: string,
  data: { name: string; display_order?: number },
): Promise<Item> {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/items`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Item>(res)
}

export async function resetDefaultItems(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/items/reset-defaults`, {
    method: 'POST',
    headers: authHeaders(token),
  })
  return handleResponse<void>(res)
}

// ── Budgets ────────────────────────────────────────────────────────────────

export async function getBudgets(token: string): Promise<Budget[]> {
  const res = await fetch(`${API_BASE}/budgets`, { headers: authHeaders(token) })
  return handleResponse<Budget[]>(res)
}

export async function createBudget(
  token: string,
  data: { name: string; period_type: Frequency; period_start: string; period_end: string },
): Promise<Budget> {
  const res = await fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Budget>(res)
}

export async function getBudgetIncome(token: string, budgetId: string): Promise<BudgetIncomeEntry[]> {
  const res = await fetch(`${API_BASE}/budgets/${budgetId}/income`, { headers: authHeaders(token) })
  return handleResponse<BudgetIncomeEntry[]>(res)
}

export async function getBudgetExpenses(token: string, budgetId: string): Promise<BudgetExpenseEntry[]> {
  const res = await fetch(`${API_BASE}/budgets/${budgetId}/expenses`, { headers: authHeaders(token) })
  return handleResponse<BudgetExpenseEntry[]>(res)
}

export async function getBudgetReport(token: string, budgetId: string): Promise<BudgetReport> {
  const res = await fetch(`${API_BASE}/budgets/${budgetId}/report`, { headers: authHeaders(token) })
  return handleResponse<BudgetReport>(res)
}

export async function upsertBudgetIncome(
  token: string,
  budgetId: string,
  sourceId: string,
  data: { amount: number; notes?: string },
): Promise<void> {
  const res = await fetch(`${API_BASE}/budgets/${budgetId}/income/${sourceId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<void>(res)
}

export async function deleteBudgetIncome(token: string, budgetId: string, sourceId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/budgets/${budgetId}/income/${sourceId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return handleResponse<void>(res)
}

export async function upsertBudgetExpense(
  token: string,
  budgetId: string,
  itemId: string,
  data: { amount: number; is_fixed?: boolean; notes?: string },
): Promise<void> {
  const res = await fetch(`${API_BASE}/budgets/${budgetId}/expenses/${itemId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<void>(res)
}

export async function deleteBudgetExpense(token: string, budgetId: string, itemId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/budgets/${budgetId}/expenses/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return handleResponse<void>(res)
}

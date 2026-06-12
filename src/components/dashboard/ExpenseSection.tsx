import { useState } from 'react'
import type { Category, ReportCategorySummary } from '../../api/budget'
import TipBanner from './TipBanner'
import './ExpenseSection.css'

function fmt(value: string | number) {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

interface ExpenseSectionProps {
  categories: Category[]
  reportCategories: ReportCategorySummary[]
  onSetExpense: (itemId: string, amount: number) => Promise<void>
  onRemoveExpense: (itemId: string) => Promise<void>
  onAddCategory: (name: string) => Promise<void>
  onAddItem: (categoryId: string, name: string) => Promise<void>
  onResetDefaults: () => Promise<void>
  loading: boolean
}

export default function ExpenseSection({
  categories,
  reportCategories,
  onSetExpense,
  onRemoveExpense,
  onAddCategory,
  onAddItem,
  onResetDefaults,
  loading,
}: ExpenseSectionProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingAmount, setEditingAmount] = useState<{ itemId: string; value: string } | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const reportItemMap = new Map(
    reportCategories.flatMap(c => c.items.map(i => [i.expense_item_id, i]))
  )
  const totalExpenses = reportCategories.reduce((sum, c) => sum + parseFloat(c.total), 0)

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleAmountSave(itemId: string) {
    if (!editingAmount || editingAmount.itemId !== itemId) return
    const amount = parseFloat(editingAmount.value)
    setSaving(itemId)
    try {
      if (isNaN(amount) || amount <= 0) {
        await onRemoveExpense(itemId)
      } else {
        await onSetExpense(itemId, amount)
      }
    } finally {
      setSaving(null)
      setEditingAmount(null)
    }
  }

  async function handleAddItem(categoryId: string) {
    if (!newItemName.trim()) return
    await onAddItem(categoryId, newItemName.trim())
    setNewItemName('')
    setAddingItemFor(null)
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    await onAddCategory(newCategoryName.trim())
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  async function handleReset() {
    await onResetDefaults()
    setConfirmReset(false)
  }

  return (
    <section className="expense-section">
      <div className="dash-section__header">
        <h2 className="dash-section__title">
          <span className="dash-section__icon">💸</span>
          Expenses
          <span className="dash-section__badge expense-badge">outs</span>
        </h2>
        {totalExpenses > 0 && (
          <span className="dash-section__total expense-total">{fmt(totalExpenses)} / mo</span>
        )}
      </div>

      <TipBanner id="expense-section">
        Start with fixed, unavoidable costs — rent, utilities, insurance. Then add
        variable spending like groceries and dining. Enter the amount you plan to spend,
        not what you usually spend.
      </TipBanner>

      {loading && <p className="dash-section__loading">Loading…</p>}

      {!loading && categories.length === 0 && (
        <div className="expense-empty">
          <p>No expense categories yet.</p>
          <button className="btn btn-primary" onClick={onResetDefaults}>
            Load default categories
          </button>
        </div>
      )}

      {categories.map(category => {
        const reportCat = reportCategories.find(r => r.category_id === category.id)
        const isOpen = !collapsed.has(category.id)
        const visibleItems = category.items.filter(i => !i.is_hidden)

        return (
          <div key={category.id} className="expense-category">
            <button
              className="expense-category__header"
              onClick={() => toggleCollapse(category.id)}
              aria-expanded={isOpen}
            >
              <span className="expense-category__chevron">{isOpen ? '▾' : '▸'}</span>
              <span className="expense-category__name">{category.name}</span>
              {reportCat && parseFloat(reportCat.total) > 0 && (
                <span className="expense-category__total">{fmt(reportCat.total)}</span>
              )}
            </button>

            {isOpen && (
              <div className="expense-category__body">
                {visibleItems.length === 0 && (
                  <p className="expense-category__empty">No items yet — add one below.</p>
                )}

                {visibleItems.map(item => {
                  const entry = reportItemMap.get(item.id)
                  const isEditing = editingAmount?.itemId === item.id
                  const isSaving = saving === item.id

                  return (
                    <div key={item.id} className={`expense-item ${entry ? 'is-set' : ''}`}>
                      <span className="expense-item__name">{item.name}</span>
                      <div className="expense-item__right">
                        {isEditing ? (
                          <div className="expense-item__edit">
                            <span className="expense-item__currency">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              autoFocus
                              value={editingAmount.value}
                              onChange={e => setEditingAmount({ itemId: item.id, value: e.target.value })}
                              onBlur={() => handleAmountSave(item.id)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleAmountSave(item.id)
                                if (e.key === 'Escape') setEditingAmount(null)
                              }}
                              className="expense-item__input"
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          <button
                            className={`expense-item__amount-btn ${entry ? 'has-value' : 'is-empty'}`}
                            onClick={() => setEditingAmount({ itemId: item.id, value: entry ? entry.amount : '' })}
                            disabled={isSaving}
                          >
                            {isSaving ? '…' : entry ? fmt(entry.amount) : '+ Set amount'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {addingItemFor === category.id ? (
                  <div className="expense-add-item">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Item name"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddItem(category.id)
                        if (e.key === 'Escape') { setAddingItemFor(null); setNewItemName('') }
                      }}
                      className="expense-add-item__input"
                    />
                    <button className="btn btn-primary" onClick={() => handleAddItem(category.id)}>Add</button>
                    <button className="btn btn-ghost" onClick={() => { setAddingItemFor(null); setNewItemName('') }}>Cancel</button>
                  </div>
                ) : (
                  <button className="expense-add-item-btn" onClick={() => { setAddingItemFor(category.id); setNewItemName('') }}>
                    + Add item
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="expense-actions">
        {showNewCategory ? (
          <div className="expense-add-category">
            <input
              type="text"
              autoFocus
              placeholder="Category name"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddCategory()
                if (e.key === 'Escape') { setShowNewCategory(false); setNewCategoryName('') }
              }}
              className="expense-add-item__input"
            />
            <button className="btn btn-primary" onClick={handleAddCategory}>Add</button>
            <button className="btn btn-ghost" onClick={() => { setShowNewCategory(false); setNewCategoryName('') }}>Cancel</button>
          </div>
        ) : (
          <button className="add-entry-btn" onClick={() => setShowNewCategory(true)}>
            + Add category
          </button>
        )}

        {categories.length > 0 && (
          confirmReset ? (
            <div className="expense-reset-confirm">
              <span>Reset all to defaults? Custom categories will be removed.</span>
              <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleReset}>Yes, reset</button>
              <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          ) : (
            <button className="expense-reset-btn" onClick={() => setConfirmReset(true)}>
              Reset to defaults
            </button>
          )
        )}
      </div>
    </section>
  )
}

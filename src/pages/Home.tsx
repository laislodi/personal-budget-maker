import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const allocationOptions = [
  { icon: '✈️', title: 'Vacation & Travel', description: 'Set aside money for that trip you keep postponing. Planned fun is guilt-free fun.' },
  { icon: '📈', title: 'Investments', description: 'Put surplus dollars to work — index funds, ETFs, or your retirement account.' },
  { icon: '🏦', title: 'Emergency Fund', description: 'Aim for 3–6 months of expenses in a liquid savings account before anything else.' },
  { icon: '🏠', title: 'Home Purchase', description: 'Saving for a down payment is easier when every extra dollar is earmarked for it.' },
  { icon: '🎯', title: 'Savings Goals', description: 'A new car, home renovation, college fund — give every goal its own bucket.' },
  { icon: '🤝', title: 'Donations & Giving', description: 'Charitable giving is a budget category too. Plan it intentionally.' },
]

const deficitActions = [
  { icon: '🔍', title: 'Audit subscriptions', description: 'List every recurring charge. Cancel anything you haven\'t used in 30 days.' },
  { icon: '🍽️', title: 'Cut dining out', description: 'Restaurant and delivery spending is often the fastest category to reduce.' },
  { icon: '📞', title: 'Renegotiate bills', description: 'Call your internet, insurance, and phone providers — rates are often negotiable.' },
  { icon: '💼', title: 'Add a side income', description: 'Freelancing, part-time work, or selling unused items can close a small gap quickly.' },
]

const steps = [
  { number: '01', title: 'Create your account', description: 'Sign up in seconds. No credit card required.' },
  { number: '02', title: 'Set up your income', description: 'Add every income source — wages, side hustles, dividends — with its pay frequency and a reference date.' },
  { number: '03', title: 'Fill in your expenses', description: 'Work through each category. Add, hide, or rename any line item to match your life.' },
  { number: '04', title: 'Review your report', description: 'See your total income, total expenses, and the balance — all normalized to the same period.' },
  { number: '05', title: 'Adjust until you reach zero', description: 'Allocate any surplus to a goal. Trim any category causing a deficit. Repeat monthly.' },
]

export default function Home() {
  const { isLoggedIn } = useAuth()

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">Zero-Based Budgeting</span>
            <h1 className="hero-title">Every dollar<br />has a purpose.</h1>
            <p className="hero-subtitle">
              Personal Budget Maker helps you build a budget where your income minus
              your expenses always equals zero — so no dollar is left unassigned or unaccounted for.
            </p>
            <div className="hero-actions">
              {isLoggedIn ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to my budget →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get started — it's free
                  </Link>
                  <Link to="/login" className="btn btn-ghost btn-lg">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── What is a budget ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-grid">
            <div className="section-text">
              <h2 className="section-title">What is a budget?</h2>
              <p>
                A budget is a written plan for your money — made in advance, before the month begins.
                It answers one question: <em>"When income arrives, where does each dollar go?"</em>
              </p>
              <p>
                Without a plan, money tends to disappear into small, unnoticed purchases.
                With a plan, you decide consciously — whether that means paying a bill, building savings,
                or enjoying a dinner out. Every choice is intentional.
              </p>
              <p>
                A budget is not a restriction. It's permission — structured permission to spend on what
                matters, backed by the confidence that the essentials are already covered.
              </p>
            </div>
            <div className="budget-visual">
              <div className="budget-card">
                <div className="budget-row income">
                  <span className="budget-label">Total income</span>
                  <span className="budget-amount">+ $5,200</span>
                </div>
                <div className="budget-row expenses">
                  <span className="budget-label">Total expenses</span>
                  <span className="budget-amount">− $4,800</span>
                </div>
                <div className="budget-divider" />
                <div className="budget-row balance">
                  <span className="budget-label">Balance</span>
                  <span className="budget-amount balance-amount">$400</span>
                </div>
                <p className="budget-hint">← $400 left to assign</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Zero rule ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">The zero rule</h2>
            <p className="section-subtitle">
              The goal of every budget is a balance of exactly <strong>$0</strong>.
              That doesn't mean spending everything — it means assigning everything.
            </p>
          </div>

          <div className="zero-equation">
            <div className="eq-block income-block">
              <span className="eq-label">Income</span>
              <span className="eq-value">$5,200</span>
            </div>
            <span className="eq-op">−</span>
            <div className="eq-block expense-block">
              <span className="eq-label">Expenses &amp; allocations</span>
              <span className="eq-value">$5,200</span>
            </div>
            <span className="eq-op">=</span>
            <div className="eq-block zero-block">
              <span className="eq-label">Balance</span>
              <span className="eq-value">$0</span>
            </div>
          </div>

          <div className="outcome-grid">
            <div className="outcome-card outcome-positive">
              <div className="outcome-header">
                <span className="outcome-icon">📊</span>
                <h3>You have a surplus</h3>
                <span className="outcome-badge positive">Balance &gt; $0</span>
              </div>
              <p>
                Extra money is a good problem — but leaving it unassigned means it will drift
                toward impulse spending. Assign it intentionally to a goal before the month starts.
              </p>
              <p className="outcome-cta">Scroll down to see where surplus money can go →</p>
            </div>
            <div className="outcome-card outcome-negative">
              <div className="outcome-header">
                <span className="outcome-icon">⚠️</span>
                <h3>You have a deficit</h3>
                <span className="outcome-badge negative">Balance &lt; $0</span>
              </div>
              <p>
                Spending more than you earn is unsustainable. The budget is telling you something
                needs to change — either reduce an expense category or find a way to grow income.
              </p>
              <p className="outcome-cta">Scroll down for deficit strategies →</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Where extra money goes ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Where does extra money go?</h2>
            <p className="section-subtitle">
              A surplus isn't unspent money — it's money waiting for a destination.
              Pick one (or several) and give it a name.
            </p>
          </div>
          <div className="card-grid">
            {allocationOptions.map((option) => (
              <div key={option.title} className="feature-card">
                <span className="feature-icon">{option.icon}</span>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── When you're in the red ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">When you're in the red</h2>
            <p className="section-subtitle">
              A deficit means expenses exceed income. Here are the levers to pull.
            </p>
          </div>
          <div className="card-grid card-grid-4">
            {deficitActions.map((action) => (
              <div key={action.title} className="feature-card feature-card-compact">
                <span className="feature-icon">{action.icon}</span>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to get started ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How to build your budget</h2>
            <p className="section-subtitle">Five steps, done once a month.</p>
          </div>
          <div className="steps">
            {steps.map((step, i) => (
              <div key={step.number} className="step">
                <div className="step-number">{step.number}</div>
                <div className="step-connector" style={{ visibility: i < steps.length - 1 ? 'visible' : 'hidden' }} />
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to give every dollar a job?</h2>
            <p>Create your free account and build your first budget in minutes.</p>
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Open my dashboard →
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                Get started — it's free
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}

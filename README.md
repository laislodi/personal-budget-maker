# Personal Budget Maker — Frontend

A React + TypeScript single-page application for zero-based budgeting. Every dollar of income is assigned a job before the month begins, so the balance always reaches exactly **$0**.

The frontend talks to a FastAPI backend — see the [backend repository](https://github.com/laislodi/personal-budget-maker) for its setup and API documentation.

---

## What is a zero-based budget?

A budget is a written, intentional plan for your money — made *before* the month begins, not after. The zero-based approach assigns every dollar of income to a category (expenses, savings, or goals) until nothing is left unaccounted for:

```
Income − (Expenses + Savings + Goals) = $0
```

| Without a budget | With a budget |
|---|---|
| You wonder where your money went | Every dollar was told where to go |
| Unexpected expenses feel like emergencies | A buffer category absorbs surprises |
| Saving feels impossible | Savings is just another line item |
| Goals stay vague ("someday…") | Goals have a monthly dollar amount |
| Debt tends to grow | Spending stays within actual income |

**Surplus (balance > $0):** unassigned money — allocate it intentionally (vacation fund, retirement, extra debt payment).  
**Deficit (balance < $0):** your plan spends more than you earn — find a category to trim or a way to grow income.

---

## Features

- **Dashboard** — monthly budget view with prev/next navigation; creates a new budget for any month on demand
- **Income section** — add income sources (wages, dividends, side hustles) with pay frequency; amounts normalised to monthly equivalents automatically
- **Expense section** — collapsible categories with line items; click any item to set its planned amount; 54 default items seeded from the backend, fully customisable
- **Live summary bar** — income, expenses, and remaining balance update in real time as entries are added or removed
- **Floating balance indicator** — a compact status bar slides up from the bottom when you scroll past the summary, keeping the remaining balance always visible
- **Contextual tips** — dismissible guidance that adapts to the current budget state (empty, surplus, deficit, balanced)
- **JWT authentication** — register, login, persistent session via localStorage

---

## Tech stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| [Python](https://python.org) | 3.11 | Runtime |
| [FastAPI](https://fastapi.tiangolo.com) | ≥ 0.115 | Web framework + OpenAPI docs |
| [SQLAlchemy](https://www.sqlalchemy.org) | ≥ 2.0 | Async ORM (`Mapped[]` + `mapped_column()`) |
| [Alembic](https://alembic.sqlalchemy.org) | ≥ 1.13 | Database migrations |
| [Pydantic v2](https://docs.pydantic.dev) | ≥ 2.7 | Request / response validation |
| [aiosqlite](https://github.com/omnilib/aiosqlite) | ≥ 0.20 | SQLite async driver (local dev) |
| [asyncpg](https://github.com/MagicStack/asyncpg) | ≥ 0.29 | PostgreSQL async driver (production) |
| [python-jose](https://github.com/mpdavis/python-jose) | ≥ 3.3 | JWT encode / decode |
| [passlib](https://passlib.readthedocs.io) | ≥ 1.7 | Password hashing (bcrypt) |


### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 18 | UI component library |
| [TypeScript](https://www.typescriptlang.org) | 5 | Static typing throughout |
| [Vite](https://vitejs.dev) | 5 | Build tool and dev server |
| [React Router](https://reactrouter.com) | 6 | Client-side routing |

No UI component library, no CSS framework — styles are written from scratch using CSS custom properties for consistency.

---

## Project structure

```
src/
├── api/
│   ├── auth.ts              # Login / register fetch wrappers
│   └── budget.ts            # All budget, income, expense, and report API calls + types
├── components/
│   ├── dashboard/
│   │   ├── BudgetSummary    # Income / expense / balance bar with progress indicator
│   │   ├── FloatingSummary  # Sticky pill that appears on scroll
│   │   ├── IncomeSection    # Income source list and add form
│   │   ├── ExpenseSection   # Category accordion with inline amount editing
│   │   └── TipBanner        # Dismissible tip with localStorage persistence
│   ├── FormField            # Reusable labeled input with error state
│   ├── Navbar               # Top navigation
│   └── PasswordStrength     # Live password rule feedback on register
├── context/
│   └── AuthContext.tsx      # isLoggedIn, token, login(), logout()
├── hooks/
│   └── usePasswordVisibility.ts
├── pages/
│   ├── Home.tsx             # Marketing / landing page
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Dashboard.tsx        # Main budget page — useDashboard hook lives here
└── utils/
    └── validation.ts        # Shared form validation rules
```

---

## API endpoints

To see all the API endpoints, check [the backend project](https://github.com/laislodi/personal-budget-maker-api)

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE` | No | Base URL for API calls. Omit entirely for local dev — the Vite proxy handles routing. In production the build targets the Render URL directly. |
| `VITE_BASE_PATH` | No | Base path for GitHub Pages deployment (e.g. `/personal-budget-maker`). Injected by the CI workflow; defaults to `/` locally. |

---

## Getting started

### 1. Backend

The frontend proxies all `/api/*` requests to `http://localhost:8000` in development, so the backend must be running locally before you start the dev server.

See the [backend repository](https://github.com/laislodi/personal-budget-maker) for setup instructions.

### 2. Frontend

```bash
# Install dependencies
npm install

# Start the dev server (proxies /api/* → http://localhost:8000)
npm run dev
# → http://localhost:5173
```

The Vite proxy means no CORS configuration is needed for local development — requests reach the backend as server-to-server calls.

```bash
# Type-check
npx tsc --noEmit

# Production build
npm run build
```

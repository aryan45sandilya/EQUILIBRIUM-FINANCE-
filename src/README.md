<div align="center">

# ⚖️ EQUILIBRIUM FINANCE

### *Smart Expense Splitting. Zero Drama.*

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio)](https://socket.io)
[![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.dev)

**A production-grade Splitwise alternative** — track group expenses, simplify debts with a greedy algorithm, settle up in real-time, and get notified instantly.

[Live Demo](#) · [Report Bug](https://github.com/aryan45sandilya/EQUILIBRIUM-FINANCE/issues) · [Request Feature](https://github.com/aryan45sandilya/EQUILIBRIUM-FINANCE/issues)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 **Group Management** | Create groups, invite members by email, manage roles |
| 💸 **Flexible Expense Splitting** | Equal, Percentage, Exact, or Shares-based splits |
| 🧠 **Debt Simplification** | Greedy Min-Cash-Flow algorithm — minimum transactions, maximum clarity |
| 🔔 **Real-time Notifications** | Socket.IO powered — get notified the moment an expense is added |
| ✅ **One-click Settlement** | Mark debts as paid, balances update instantly |
| 📊 **Spend Analytics** | Per-category and per-member breakdown charts |
| 🔐 **Clerk Authentication** | Passwordless sign-in, OAuth, secure JWT flow |

---

## 🏗️ Project Structure

```
equilibrium-finance/
│
├── 📁 frontend/                    # Next.js 14 App Router
│   └── src/
│       ├── app/
│       │   ├── (app)/              # Protected routes
│       │   │   ├── dashboard/      # Home dashboard
│       │   │   ├── groups/         # Group list + detail
│       │   │   ├── simplification/ # Debt simplification view
│       │   │   └── report/         # Spend analytics
│       │   └── (auth)/             # Clerk sign-in / sign-up
│       ├── components/
│       │   ├── expenses/           # AddExpenseModal, ExpenseList
│       │   ├── groups/             # MemberList, DebtPanel
│       │   └── layout/             # AppHeader, MobileNav, NotificationBell
│       ├── lib/
│       │   ├── api.ts              # Typed API client (all endpoints)
│       │   └── socket.ts           # Socket.IO client
│       └── store/
│           └── ui.store.ts         # Zustand UI state
│
├── 📁 backend/                     # Express REST API + Socket.IO
│   └── src/
│       ├── routes/                 # auth, expenses, groups, settlements...
│       ├── services/               # Business logic layer
│       │   ├── expense.service.ts
│       │   ├── group.service.ts
│       │   ├── settlement.service.ts
│       │   ├── notification.service.ts
│       │   └── debtSimplification.service.ts  ← 🧠 Core algorithm
│       ├── middleware/             # Auth (Clerk JWT), validation, errors
│       ├── lib/                    # Supabase, Redis, Logger
│       └── socket/                 # Socket.IO rooms + event emitters
│
├── 📁 prisma/
│   └── schema.prisma               # Full DB schema
│
├── 🐳 docker-compose.yml
└── ⚙️ .github/workflows/ci.yml
```

---

## 🧠 Debt Simplification Algorithm

> The core of Equilibrium — converts a tangle of group debts into the **minimum possible transactions**.

### How it works

**1. Compute net balances**
```
net[person] = total_paid - total_owed
```
- `net > 0` → creditor (is owed money)
- `net < 0` → debtor (owes money)

**2. Greedy Min-Cash-Flow matching**
```
Sort creditors (largest first), debtors (most negative first)

while creditors and debtors remain:
  amount = min(creditor.balance, |debtor.balance|)
  → debtor pays creditor `amount`
  reduce both balances, advance exhausted pointer
```

**3. Result: at most N−1 transactions (provably optimal)**

### Example
```
Group of 4. Aryan paid ₹1000, split equally.

Net balances:
  Aryan   → +750  (creditor)
  Shivansh → -250  (debtor)
  Riya     → -250  (debtor)
  Kabir    → -250  (debtor)

Simplified (3 transactions, not 6):
  Shivansh → Aryan  ₹250
  Riya     → Aryan  ₹250
  Kabir    → Aryan  ₹250

Circular debt elimination:
  A owes B ₹100, B owes C ₹50, C owes A ₹30
  Net: A = -70, B = +50, C = +20
  Result: A→B ₹50, A→C ₹20  (2 instead of 3 transactions)
```

---

## 🗄️ Database Schema (Key Tables)

```prisma
model Expense {
  id        String       @id
  groupId   String
  title     String
  amount    Float
  splitType SplitType    // EQUAL | PERCENTAGE | EXACT | SHARES
  paidById  String
  splits    ExpenseSplit[]
}

model ExpenseSplit {
  expenseId String
  userId    String
  amount    Float        // exact share amount
}

model Settlement {
  id      String
  groupId String
  fromId  String        // who paid
  toId    String        // who received
  amount  Float
  status  SettlementStatus  // PENDING | COMPLETED | CANCELLED
}

model Notification {
  userId String
  type   NotificationType  // EXPENSE_ADDED | SETTLEMENT_COMPLETED | ...
  title  String
  body   String
  read   Boolean
}
```

---

## 🔌 API Reference

All responses follow `{ success: boolean, data: T }`.

```
Auth
  POST  /api/auth/login          Clerk JWT exchange

Groups
  GET   /api/groups              List user's groups
  POST  /api/groups              Create group
  POST  /api/groups/:id/members  Add member by email
  GET   /api/groups/:id/debts    Simplified debt graph ← 🧠 algorithm runs here

Expenses
  GET   /api/expenses?groupId=   Paginated expense list
  POST  /api/expenses            Create expense (any split type)
  DELETE /api/expenses/:id       Delete expense

Settlements
  GET   /api/settlements?groupId= Group settlement history
  POST  /api/settlements          Record a payment

Notifications
  GET   /api/notifications        User's notifications
  PATCH /api/notifications/read-all  Mark all as read

Analytics
  GET   /api/analytics?groupId=  Spend breakdown by category/member/month
```

---

## ⚡ Real-time Events (Socket.IO)

| Event | Direction | Payload |
|---|---|---|
| `expense:created` | server → group room | full expense object |
| `expense:deleted` | server → group room | `{ expenseId, groupId }` |
| `settlement:created` | server → group room | settlement object |
| `notification:new` | server → user | notification payload |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- Docker Desktop

### 1. Clone
```bash
git clone https://github.com/aryan45sandilya/EQUILIBRIUM-FINANCE.git
cd EQUILIBRIUM-FINANCE/src
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in CLERK_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local  # fill in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
npm install
npm run dev
```

Open **http://localhost:3000** · API at **http://localhost:4000**

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, TanStack Query, Zustand |
| **Backend** | Express.js, TypeScript, Zod |
| **Database** | PostgreSQL via Supabase |
| **Auth** | Clerk (JWT) |
| **Realtime** | Socket.IO |
| **Testing** | Vitest |
| **CI/CD** | GitHub Actions |

---

## 📦 Deployment

- **Frontend** → Vercel
- **Backend** → Railway / Render
- **Database** → Supabase (hosted PostgreSQL)

---

<div align="center">

Built with 🖤 by [Aryan Sandilya](https://github.com/aryan45sandilya)

</div>

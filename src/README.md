<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Black+Han+Sans&size=42&pause=1000&color=000000&background=E0FF00&center=true&vCenter=true&width=600&height=80&lines=⚖️+EQUILIBRIUM+FINANCE;Smart+Splits.+Zero+Drama." alt="Typing SVG" />

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

<br/>

![GitHub repo size](https://img.shields.io/github/repo-size/aryan45sandilya/EQUILIBRIUM-FINANCE-?style=flat-square&color=E0FF00&labelColor=000000)
![GitHub last commit](https://img.shields.io/github/last-commit/aryan45sandilya/EQUILIBRIUM-FINANCE-?style=flat-square&color=FF00F5&labelColor=000000)
![GitHub stars](https://img.shields.io/github/stars/aryan45sandilya/EQUILIBRIUM-FINANCE-?style=flat-square&color=00D1FF&labelColor=000000)

<br/>

> **A production-grade Splitwise alternative** — split expenses, simplify debts with a greedy algorithm, settle up in real-time, and get notified instantly.

<br/>

[🚀 Live Demo](#) &nbsp;·&nbsp; [🐛 Report Bug](https://github.com/aryan45sandilya/EQUILIBRIUM-FINANCE-/issues) &nbsp;·&nbsp; [✨ Request Feature](https://github.com/aryan45sandilya/EQUILIBRIUM-FINANCE-/issues)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

**🏠 Group Management**
Create expense groups, invite members by email, assign roles

**💸 Flexible Splits**
Equal · Percentage · Exact · Shares

**🧠 Debt Simplification**
Greedy Min-Cash-Flow — minimum transactions guaranteed

**🔔 Real-time Notifications**
Socket.IO — instant alerts on new expenses

</td>
<td width="50%">

**✅ One-click Settlement**
Mark debts paid, balances update instantly

**📊 Spend Analytics**
Category and member breakdown with charts

**🔐 Clerk Authentication**
Passwordless sign-in, OAuth, secure JWT

**📱 Responsive UI**
Brutalist design — mobile and desktop ready

</td>
</tr>
</table>

---

## 🏗️ Project Structure

```
📦 EQUILIBRIUM-FINANCE
├── 📁 frontend/                    # Next.js 14 App Router
│   └── src/
│       ├── app/
│       │   ├── (app)/              # 🔒 Protected routes
│       │   │   ├── dashboard/      # 📊 Home dashboard
│       │   │   ├── groups/         # 👥 Group list + detail
│       │   │   ├── simplification/ # 🧠 Debt simplification
│       │   │   └── report/         # 📈 Spend analytics
│       │   └── (auth)/             # 🔐 Clerk sign-in / sign-up
│       ├── components/
│       │   ├── expenses/           # AddExpenseModal, ExpenseList
│       │   ├── groups/             # MemberList, DebtPanel
│       │   └── layout/             # AppHeader, MobileNav, NotificationBell
│       └── lib/
│           ├── api.ts              # Typed API client (all endpoints)
│           └── socket.ts           # Socket.IO client
│
├── 📁 backend/                     # Express REST API + Socket.IO
│   └── src/
│       ├── routes/                 # auth, expenses, groups, settlements
│       ├── services/
│       │   ├── expense.service.ts
│       │   ├── group.service.ts
│       │   ├── settlement.service.ts
│       │   ├── notification.service.ts
│       │   └── debtSimplification.service.ts  ← 🧠 Core algorithm
│       ├── middleware/             # Auth (Clerk JWT), validation, errors
│       └── socket/                # Socket.IO rooms + event emitters
│
├── 📁 prisma/
│   └── schema.prisma               # Full DB schema
├── 🐳 docker-compose.yml
└── ⚙️ .github/workflows/ci.yml
```

---

## 🧠 Debt Simplification Algorithm

```
╔══════════════════════════════════════════════════════════════╗
║          GREEDY MIN-CASH-FLOW ALGORITHM                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Step 1: net[person] = Σ(paid) - Σ(owed)                    ║
║          net > 0 → creditor  |  net < 0 → debtor            ║
║                                                              ║
║  Step 2: Sort creditors ↓ largest first                      ║
║          Sort debtors ↑ most negative first                  ║
║                                                              ║
║  Step 3: amount = min(creditor.bal, |debtor.bal|)            ║
║          record transaction → reduce balances → repeat       ║
║                                                              ║
║  Result: at most N-1 transactions  ✅ Provably optimal       ║
╚══════════════════════════════════════════════════════════════╝
```

**Example**
```
Group of 4. Aryan paid ₹1000, split equally.

Net balances:
  Aryan    → +750   (creditor)
  Shivansh → -250   (debtor)
  Riya     → -250   (debtor)
  Kabir    → -250   (debtor)

Result — 3 transactions (not 6):
  ✅ Shivansh → Aryan  ₹250
  ✅ Riya     → Aryan  ₹250
  ✅ Kabir    → Aryan  ₹250
```

---

## 🔌 API Reference

```
🔐 Auth
   POST   /api/auth/login               Clerk JWT exchange

👥 Groups
   GET    /api/groups                   List user's groups
   POST   /api/groups                   Create group
   POST   /api/groups/:id/members       Add member by email
   GET    /api/groups/:id/debts         🧠 Simplified debt graph

💸 Expenses
   GET    /api/expenses?groupId=        Paginated expense list
   POST   /api/expenses                 Create expense (any split type)
   DELETE /api/expenses/:id             Delete expense

✅ Settlements
   GET    /api/settlements?groupId=     Settlement history
   POST   /api/settlements              Record a payment

🔔 Notifications
   GET    /api/notifications            User's notifications
   PATCH  /api/notifications/read-all   Mark all read

📊 Analytics
   GET    /api/analytics?groupId=       Spend by category/member/month
```

---

## ⚡ Real-time Events (Socket.IO)

| Event | Direction | Trigger |
|:---|:---|:---|
| `expense:created` | server → group room | New expense added |
| `expense:deleted` | server → group room | Expense removed |
| `settlement:created` | server → group room | Payment recorded |
| `notification:new` | server → user | Personal alert |

---

## 🚀 Local Setup

**Prerequisites:** Node.js 20+

```bash
# 1. Clone
git clone https://github.com/aryan45sandilya/EQUILIBRIUM-FINANCE-.git
cd EQUILIBRIUM-FINANCE-/src

# 2. Backend
cd backend
cp .env.example .env        # add CLERK_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install && npm run dev

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local  # add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
npm install && npm run dev
```

🌐 **http://localhost:3000** · 🔌 API **http://localhost:4000**

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, TanStack Query, Zustand |
| **Backend** | Express.js, TypeScript, Zod validation |
| **Database** | PostgreSQL via Supabase |
| **Auth** | Clerk (JWT + OAuth) |
| **Realtime** | Socket.IO |
| **Testing** | Vitest |
| **CI/CD** | GitHub Actions |
| **Deploy** | Vercel (frontend) · Railway (backend) |

---

<div align="center">

![Wave](https://capsule-render.vercel.app/api?type=waving&color=0:E0FF00,100:FF00F5&height=120&section=footer&text=Built+by+Aryan+Sandilya&fontColor=000000&fontSize=20&fontAlignY=70)

</div>

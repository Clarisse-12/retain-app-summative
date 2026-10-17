# Retain — Personal Expense & Budget Manager

A full-stack web application for managing personal expenses and monthly budgets, built with React + TypeScript on the frontend and Node.js + Express + PostgreSQL on the backend.

## Live Demo

> **Deployed URL:** `<add your deployed URL here>`

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [API Reference](#api-reference)
- [Authentication and Roles](#authentication-and-roles)
- [Admin Credentials](#admin-credentials)

---

## Features

### Normal User

- Sign up, sign in, sign out with JWT-based authentication
- **Expense management** — create, view, update, and delete personal expenses
  - Each expense has: title, amount, date, category, payment method, and optional description
  - Payment methods: Cash, Card, Bank Transfer, Mobile Payment, Other
- **Expense filtering and sorting** (managed with Redux)
  - Filter by category, payment method, date range, amount min/max, keyword search
  - Sort by date, amount, or title (ascending or descending)
  - Paginated results
- **Budget tracking** — set monthly budgets per category or overall
  - View total budgeted, total spent, and remaining budget
  - Budget status label per budget: **Within budget** / **Approaching** (80%+) / **Over budget** (100%+)
  - Past months always show Over budget; future months always show Approaching
  - Navigate any month and year to view past or future budgets
- **User dashboard** (selectable month/year)
  - Total spending for the selected month
  - Remaining monthly budget
  - Highest individual expense
  - Spending by category with progress bars
  - Budget progress per category with status labels
  - Recent expenses (last 5 across all time)

### Admin

- **Admin dashboard** with full platform insights:
  - Total number of registered users
  - Total number of expenses recorded
  - Total value of all expenses recorded
  - Number of expenses recorded during the current month
  - Total spending per category
  - Top 5 most-used expense categories
  - Bottom 5 least-used expense categories
  - Recently added expenses (platform-wide, last 10)
  - Recently registered users (last 5)
- **Category management** on a dedicated Categories page
  - Create, update, and delete expense categories
  - Deleting a category automatically sets affected expenses to uncategorised (via Prisma `onDelete: SetNull`)

### Access Control

| Page | Normal User | Admin |
|---|---|---|
| Dashboard | Yes | No (redirected to /admin) |
| Expenses | Yes | No |
| Budgets | Yes | No |
| Admin Dashboard | No | Yes |
| Categories (CRUD) | No | Yes |

---

## Technologies Used

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety and maintainability |
| Vite | 8 | Build tool and dev server |
| React Router | v7 | Client-side routing and protected routes |
| React Context API | — | Authentication state, roles, protected routes |
| Redux Toolkit | 2 | Expense filtering, searching, sorting state |
| React Redux | 9 | Connecting Redux to React components |
| Axios | 1 | HTTP client for API requests |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5 | REST API framework |
| Prisma ORM | 6 | Database schema and queries |
| PostgreSQL | — | Relational database |
| JSON Web Tokens | 9 | Authentication tokens |
| bcryptjs | 3 | Password hashing |
| Zod | 4 | Request validation |

---

## Project Structure

```
retain-app-summative/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/              # Auto-generated migration files
│   │   ├── schema.prisma            # Models: User, Expense, Budget, Category
│   │   └── seed.js                  # Seeds admin user + default categories
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Prisma client singleton
│   │   │
│   │   ├── controllers/
│   │   │   ├── admin.controller.js  # Platform stats, users, insights
│   │   │   ├── auth.controller.js   # Register, login, me
│   │   │   ├── budget.controller.js # Budget CRUD + summary
│   │   │   ├── category.controller.js
│   │   │   └── expense.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── admin.middleware.js  # Blocks non-admin users (403)
│   │   │   ├── auth.middleware.js   # Verifies JWT token
│   │   │   ├── error.middleware.js  # Global error handler
│   │   │   └── validate.middleware.js # Zod schema validation
│   │   │
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── budget.routes.js
│   │   │   ├── category.routes.js
│   │   │   └── expense.routes.js
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── budget.validator.js
│   │   │   ├── category.validator.js
│   │   │   └── expense.validator.js
│   │   │
│   │   └── app.js                   # Express entry point
│   │
│   ├── .env                         # Local environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    │
    ├── src/
    │   ├── components/
    │   │   └── Layout.tsx            # Sidebar nav + page wrapper
    │   │
    │   ├── context/
    │   │   └── AuthContext.tsx       # Auth state, login, logout, isAdmin
    │   │
    │   ├── pages/
    │   │   ├── AdminCategoriesPage.tsx  # Admin: category CRUD
    │   │   ├── AdminPage.tsx            # Admin: platform insights
    │   │   ├── BudgetsPage.tsx          # User: budget tracking
    │   │   ├── DashboardPage.tsx        # User: monthly summary
    │   │   ├── ExpensesPage.tsx         # User: expense CRUD + filters
    │   │   ├── LandingPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   └── RegisterPage.tsx
    │   │
    │   ├── services/
    │   │   └── api.ts                # Axios instance + all API functions
    │   │
    │   ├── store/
    │   │   ├── filtersSlice.ts       # Redux: expense filter state
    │   │   └── index.ts              # Redux store
    │   │
    │   ├── types/
    │   │   └── index.ts              # All TypeScript interfaces and types
    │   │
    │   ├── App.tsx                   # Routes + RequireAuth/RequireAdmin guards
    │   └── main.tsx
    │
    ├── .env                          # Local environment variables
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A PostgreSQL database (local or hosted — Supabase, Neon, Railway all work)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd retain-app-summative
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your database URL and JWT secret (see [Environment Variables](#environment-variables)).

Run migrations to create the database tables:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Seed the admin account and default categories:

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Start the frontend development server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Environment Variables

### `backend/.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/retain"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### `frontend/.env`

```env
VITE_API_URL="http://localhost:5000/api"
```

---

## Seeding the Database

The seed script creates one admin user and 10 default expense categories.

```bash
cd backend
npm run seed
```

It is safe to run multiple times — existing records are not duplicated.

**Default categories created:**
Food & Dining, Transport, Housing, Entertainment, Health, Shopping, Education, Utilities, Travel, Uncategorised

---

## API Reference

**Base URL:** `http://localhost:5000/api`

Protected routes require this header:

```
Authorization: Bearer <your-jwt-token>
```

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a new user account |
| POST | `/auth/login` | Public | Login and receive a JWT token |
| GET | `/auth/me` | User | Get the current authenticated user |

### Expenses

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/expenses` | User | List own expenses with optional filters |
| POST | `/expenses` | User | Create a new expense |
| GET | `/expenses/:id` | User | Get a single expense |
| PATCH | `/expenses/:id` | User | Update an expense |
| DELETE | `/expenses/:id` | User | Delete an expense |

**GET `/expenses` — supported query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Search title and description |
| `categoryId` | string | Filter by category ID |
| `paymentMethod` | string | CASH, CARD, BANK_TRANSFER, MOBILE_PAYMENT, OTHER |
| `dateFrom` | ISO date | Start of date range |
| `dateTo` | ISO date | End of date range |
| `amountMin` | number | Minimum amount |
| `amountMax` | number | Maximum amount |
| `sortBy` | string | date, amount, or title |
| `order` | string | asc or desc |
| `page` | number | Page number (default 1) |
| `limit` | number | Results per page (default 10, max 100) |

### Budgets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/budgets` | User | List own budgets |
| POST | `/budgets` | User | Create a budget |
| GET | `/budgets/summary` | User | Budget summary with actual spending |
| PATCH | `/budgets/:id` | User | Update a budget |
| DELETE | `/budgets/:id` | User | Delete a budget |

**GET `/budgets/summary` — required query parameters:** `month` (1–12), `year`

### Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | User | List all categories |
| POST | `/categories` | Admin | Create a category |
| PATCH | `/categories/:id` | Admin | Update a category |
| DELETE | `/categories/:id` | Admin | Delete a category |

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | Platform stats + recent expenses + recent users |
| GET | `/admin/users` | Admin | All registered users with counts |
| GET | `/admin/insights/expenses` | Admin | Spending by category, top 5, bottom 5, by month |

---

## Authentication and Roles

- **React Context** (`AuthContext`) manages login state, the current user object, the `isAdmin` flag, and logout
- **Protected routes** in `App.tsx` use three guards:
  - `RequireAuth` — redirects unauthenticated users to `/login`
  - `RequireAdmin` — redirects non-admin users to `/dashboard`
  - `RequireUser` — redirects admin users away from user pages to `/admin`
- **Redux Toolkit** (`filtersSlice`) manages all expense filtering, searching, and sorting state
- **Backend** enforces authorization on every route:
  - `authMiddleware` verifies the JWT on all protected routes
  - `adminMiddleware` blocks any non-ADMIN user with a 403 response

---

## Admin Credentials

After running `npm run seed` the following admin account is available:

| Field | Value |
|---|---|
| Email | `admin@retain.app` |
| Password | `Admin1234!` |

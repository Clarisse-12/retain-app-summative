# Retain Backend

REST API for **Retain — Personal Expense & Budget Manager**.

## Technology stack

- Node.js
- Express.js 5
- PostgreSQL
- Prisma ORM 7
- JWT (jsonwebtoken)
- bcryptjs
- Zod
- dotenv
- CORS
- Nodemon (development)

---

## Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later
- npm

---

## Installation

```bash
cd backend
npm install
```

---

## PostgreSQL database setup

Open psql or pgAdmin and create the database:

```sql
CREATE DATABASE "retain-app";
```

---

## Environment variable setup

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set each value:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/retain-app
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=1d
```

Generate a strong JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Prisma setup

Generate the Prisma client:

```bash
npm run prisma:generate
```

Run the database migration to create all tables:

```bash
npm run prisma:migrate
```

When prompted, enter a migration name such as `init`.

---

## Start the server

Development (auto-restarts on file changes):

```bash
npm run dev
```

Production:

```bash
npm start
```

The server runs on `http://localhost:5000` by default.

---

## Health check

```
GET /
GET /api/health
```

---

## API endpoints

All protected routes require the header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive a token |
| GET | `/api/auth/me` | Yes | Get the current user |

### Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/categories` | Yes | List all categories |
| POST | `/api/categories` | Yes | Create a category |
| PATCH | `/api/categories/:id` | Yes | Update a category |
| DELETE | `/api/categories/:id` | Yes | Delete a category |

### Expenses

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/expenses` | Yes | List expenses (supports filters) |
| GET | `/api/expenses/:id` | Yes | Get one expense |
| POST | `/api/expenses` | Yes | Create an expense |
| PATCH | `/api/expenses/:id` | Yes | Update an expense |
| DELETE | `/api/expenses/:id` | Yes | Delete an expense |

#### Expense query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | string | Filter by category |
| `dateFrom` | ISO date | Filter from this date |
| `dateTo` | ISO date | Filter to this date |
| `search` | string | Search title and description |
| `sortBy` | date \| amount \| title | Sort field (default: date) |
| `order` | asc \| desc | Sort direction (default: desc) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Page size (default: 10, max: 100) |

### Budgets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/budgets` | Yes | List budgets |
| GET | `/api/budgets/summary` | Yes | Monthly budget vs actual spending |
| POST | `/api/budgets` | Yes | Create a budget |
| PATCH | `/api/budgets/:id` | Yes | Update a budget |
| DELETE | `/api/budgets/:id` | Yes | Delete a budget |

#### Budget query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `month` | number | Filter by month (1–12) |
| `year` | number | Filter by year |

#### Budget summary query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | number | Yes | Month (1–12) |
| `year` | number | Yes | Year |

### Admin (ADMIN role required)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Platform stats and recent expenses |
| GET | `/api/admin/users` | Admin | All users with counts |
| GET | `/api/admin/insights/expenses` | Admin | Spending by category and month |

---

## Example requests

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

Response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "clx...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

### Get current user

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Create an expense

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Lunch","amount":12.50,"date":"2025-06-15T12:00:00Z"}'
```

### List expenses with filters

```bash
curl "http://localhost:5000/api/expenses?dateFrom=2025-06-01&dateTo=2025-06-30&sortBy=amount&order=desc" \
  -H "Authorization: Bearer <token>"
```

### Create a category

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Groceries","color":"#22c55e"}'
```

### Create an overall monthly budget

```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":1500,"month":6,"year":2025}'
```

### Create a category-specific budget

```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":300,"month":6,"year":2025,"categoryId":"clx..."}'
```

### Get budget summary

```bash
curl "http://localhost:5000/api/budgets/summary?month=6&year=2025" \
  -H "Authorization: Bearer <token>"
```

---

## How to obtain and use a JWT

1. Register or login — both endpoints return a `token` field in the response.
2. Copy the token value.
3. Add it to every protected request as a header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire after the duration set in `JWT_EXPIRES_IN` (default `1d`). Login again to get a new token.

---

## How to promote a user to admin

There is no public admin registration endpoint. To promote a user, run this SQL directly in psql or pgAdmin:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'alice@example.com';
```

The user must log in again after being promoted so their new role is reflected in the token.

---

## Consistent error response format

All errors return JSON in this shape:

```json
{
  "message": "A human-readable error message"
}
```

Validation errors include a field-level breakdown:

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "amount", "message": "Amount must be greater than zero" }
  ]
}
```

---

## Common errors and troubleshooting

### `Cannot find module '../generated/prisma'`

The Prisma client has not been generated yet. Run:

```bash
npm run prisma:generate
```

### `Error: connect ECONNREFUSED 127.0.0.1:5432`

PostgreSQL is not running or the `DATABASE_URL` in `.env` is incorrect. Check that:
- PostgreSQL is running.
- The username, password, host, port, and database name in `DATABASE_URL` are correct.
- The database `retain-app` exists.

### `Invalid or expired token`

The JWT has expired or is malformed. Log in again to get a fresh token.

### `Error: secretOrPrivateKey must have a value`

`JWT_SECRET` in `.env` is empty or not set. Add a value:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output as the value of `JWT_SECRET` in `.env`.

### `P2002` unique constraint error

You are trying to create a record that already exists, such as registering with an email that is already in use, or creating a duplicate budget for the same month and category.

### CORS error in the browser

The `CLIENT_URL` in `.env` does not match the origin your frontend is running on. Make sure `CLIENT_URL=http://localhost:5173` matches your Vite dev server address.

---

## Project structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── budget.controller.js
│   │   ├── category.controller.js
│   │   └── expense.controller.js
│   ├── middleware/
│   │   ├── admin.middleware.js
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── budget.routes.js
│   │   ├── category.routes.js
│   │   └── expense.routes.js
│   ├── utils/
│   │   └── asyncHandler.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── budget.validator.js
│   │   ├── category.validator.js
│   │   └── expense.validator.js
│   └── app.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

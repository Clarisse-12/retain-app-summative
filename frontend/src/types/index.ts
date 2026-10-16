// ── User ────────────────────────────────────────────────────
export type UserRole = 'USER' | 'ADMIN';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Admin user list includes aggregate counts
export interface AdminUser extends User {
  updatedAt: string;
  _count: {
    expenses: number;
    budgets: number;
    categories: number;
  };
}

// ── Category ─────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Minimal category shape returned inside expense/budget objects
export interface CategoryRef {
  id: string;
  name: string;
}

// ── Expense ──────────────────────────────────────────────────
export interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: string;
  date: string;
  paymentMethod: PaymentMethod;
  userId: string;
  categoryId: string | null;
  category: CategoryRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  title: string;
  description?: string;
  amount: number;
  date?: string;
  categoryId?: string | null;
  paymentMethod?: PaymentMethod;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

// ── Budget ───────────────────────────────────────────────────
export interface Budget {
  id: string;
  amount: string;        // Prisma Decimal — use parseFloat()
  month: number;         // 1–12
  year: number;
  userId: string;
  categoryId: string | null;
  category: CategoryRef | null;
  createdAt: string;
  updatedAt: string;
}

// Budget summary item returned by GET /api/budgets/summary
export interface BudgetSummaryItem extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface BudgetSummaryResponse {
  summary: BudgetSummaryItem[];
  month: number;
  year: number;
  totalSpent: number;
}

export interface CreateBudgetInput {
  amount: number;
  month: number;
  year: number;
  categoryId?: string | null;
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {}

// ── Pagination ───────────────────────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── API response wrappers ────────────────────────────────────
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: Pagination;
}

export interface ExpenseResponse {
  expense: Expense;
}

export interface CategoryListResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}

export interface BudgetListResponse {
  budgets: Budget[];
}

export interface BudgetResponse {
  budget: Budget;
}

// ── Admin ────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminDashboardResponse {
  stats: AdminStats;
  recentExpenses: Expense[];
  recentUsers: RecentUser[];
}

export interface AdminUsersResponse {
  users: AdminUser[];
}

export interface SpendingByCategory {
  category: CategoryRef | null;
  totalAmount: number;
  expenseCount: number;
}

export interface SpendingByMonth {
  month: string;   // "YYYY-MM"
  totalAmount: number;
  expenseCount: number;
}

export interface AdminInsightsResponse {
  spendingByCategory: SpendingByCategory[];
  top5: SpendingByCategory[];
  bottom5: SpendingByCategory[];
  spendingByMonth: SpendingByMonth[];
}

// ── Expense filter (Redux state shape) ───────────────────────
export interface ExpenseFilters {
  search?: string;
  categoryId?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy: 'date' | 'amount' | 'title';
  order: 'asc' | 'desc';
  page: number;
  limit: number;
}

// ── Generic API error ────────────────────────────────────────
export interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: { field: string; message: string }[];
    };
  };
}

import axios from 'axios';
import type {
  AuthResponse,
  ExpenseListResponse,
  ExpenseResponse,
  CreateExpenseInput,
  UpdateExpenseInput,
  CategoryListResponse,
  CategoryResponse,
  BudgetListResponse,
  BudgetResponse,
  BudgetSummaryResponse,
  CreateBudgetInput,
  UpdateBudgetInput,
  AdminDashboardResponse,
  AdminUsersResponse,
  AdminInsightsResponse,
} from '../types';

// Create an Axios instance with the base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add a request interceptor to include the token in the Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Aunthentication API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () =>
    api.get<{ user: AuthResponse['user'] }>('/auth/me').then((r) => r.data),
};

//Expenses API
export interface ExpenseQueryParams {
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  paymentMethod?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: 'date' | 'amount' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const expenseApi = {
  list: (params: ExpenseQueryParams = {}) =>
    api.get<ExpenseListResponse>('/expenses', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ExpenseResponse>(`/expenses/${id}`).then((r) => r.data),

  create: (data: CreateExpenseInput) =>
    api.post<ExpenseResponse>('/expenses', data).then((r) => r.data),

  update: (id: string, data: UpdateExpenseInput) =>
    api.patch<ExpenseResponse>(`/expenses/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/expenses/${id}`).then((r) => r.data),
};

//Categories API
export const categoryApi = {
  list: () =>
    api.get<CategoryListResponse>('/categories').then((r) => r.data),

  create: (data: { name: string }) =>
    api.post<CategoryResponse>('/categories', data).then((r) => r.data),

  update: (id: string, data: { name?: string }) =>
    api.patch<CategoryResponse>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/categories/${id}`).then((r) => r.data),
};

//Budgets API
export const budgetApi = {
  list: (params: { month?: number; year?: number } = {}) =>
    api.get<BudgetListResponse>('/budgets', { params }).then((r) => r.data),

  summary: (month: number, year: number) =>
    api.get<BudgetSummaryResponse>('/budgets/summary', { params: { month, year } }).then((r) => r.data),

  create: (data: CreateBudgetInput) =>
    api.post<BudgetResponse>('/budgets', data).then((r) => r.data),

  update: (id: string, data: UpdateBudgetInput) =>
    api.patch<BudgetResponse>(`/budgets/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/budgets/${id}`).then((r) => r.data),
};

//Admin API
export const adminApi = {
  dashboard: () =>
    api.get<AdminDashboardResponse>('/admin/dashboard').then((r) => r.data),

  users: () =>
    api.get<AdminUsersResponse>('/admin/users').then((r) => r.data),

  insights: () =>
    api.get<AdminInsightsResponse>('/admin/insights/expenses').then((r) => r.data),
};

export default api;

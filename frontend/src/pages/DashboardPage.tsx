import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { expenseApi, budgetApi } from "../services/api";
import type { Expense, BudgetSummaryItem } from "../types";
import { useAuth } from "../context/AuthContext";
import "../styles/DashboardPage.css";

const now = new Date();
const YEARS = Array.from({ length: 9 }, (_, i) => now.getFullYear() - 3 + i);

function budgetStatus(pct: number) {
  if (pct >= 100) return { label: "Over budget",   color: "var(--color-danger)" };
  if (pct >= 80)  return { label: "Approaching",   color: "#f59e0b" };
  return              { label: "Within budget", color: "var(--color-accent)" };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [monthExpenses,  setMonthExpenses]  = useState<Expense[]>([]);
  const [budgetSummary,  setBudgetSummary]  = useState<BudgetSummaryItem[]>([]);
  const [totalSpent,     setTotalSpent]     = useState(0);
  const [loading,        setLoading]        = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const monthStart = new Date(year, month - 1, 1).toISOString();
    const monthEnd   = new Date(year, month,     1).toISOString();
    Promise.all([
      expenseApi.list({ limit: 5, sortBy: "date", order: "desc" }),
      expenseApi.list({ dateFrom: monthStart, dateTo: monthEnd, limit: 200 }),
      budgetApi.summary(month, year),
    ]).then(([recent, monthly, budRes]) => {
      setRecentExpenses(recent.expenses);
      setMonthExpenses(monthly.expenses);
      setBudgetSummary(budRes.summary);
      setTotalSpent(budRes.totalSpent);
    }).finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const totalBudgeted = budgetSummary.reduce((s, b) => s + parseFloat(b.amount), 0);
  const remaining     = totalBudgeted - totalSpent;
  const overallPct    = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const status        = budgetStatus(overallPct);

  const highestExpense = monthExpenses.reduce<Expense | null>(
    (max, e) => !max || parseFloat(e.amount) > parseFloat(max.amount) ? e : max,
    null
  );

  const categorySpend: Record<string, { name: string; total: number }> = {};
  for (const e of monthExpenses) {
    const key  = e.categoryId ?? "__none__";
    const name = e.category?.name ?? "Uncategorised";
    if (!categorySpend[key]) categorySpend[key] = { name, total: 0 };
    categorySpend[key].total += parseFloat(e.amount);
  }
  const categoryRows = Object.values(categorySpend).sort((a, b) => b.total - a.total);
  const monthLabel = new Date(year, month - 1).toLocaleString("default", { month: "long" });

  return (
    <Layout>
      <div className="dashboard-header">
        <h2>Welcome back, {user?.name}</h2>
        <div className="dashboard-picker">
          <select className="form-input picker-month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select className="form-input picker-year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* 1. Summary cards */}
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="stat-label">Spent — {monthLabel} {year}</div>
              <div className="stat-value">${totalSpent.toFixed(2)}</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Total budgeted</div>
              <div className="stat-value accent">${totalBudgeted.toFixed(2)}</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Remaining budget</div>
              <div className={`stat-value${remaining < 0 ? " danger" : ""}`}>${remaining.toFixed(2)}</div>
            </div>
            {totalBudgeted > 0 && (
              <div className="card stat-card">
                <div className="stat-label">Budget status</div>
                <div className="stat-value status" style={{ color: status.color }}>{status.label}</div>
                <div className="stat-sub">{overallPct.toFixed(0)}% used</div>
              </div>
            )}
            <div className="card stat-card">
              <div className="stat-label">Highest expense</div>
              {highestExpense ? (
                <>
                  <div className="stat-value">${parseFloat(highestExpense.amount).toFixed(2)}</div>
                  <div className="stat-sub">{highestExpense.title}</div>
                </>
              ) : (
                <div className="muted-text">No expenses</div>
              )}
            </div>
          </div>

          {/* 2. Spending by category */}
          <div className="card section-card">
            <h3>Spending by category — {monthLabel} {year}</h3>
            {categoryRows.length === 0 ? (
              <p className="muted-text">No expenses recorded for this month.</p>
            ) : (
              categoryRows.map((c) => {
                const pct = totalSpent > 0 ? (c.total / totalSpent) * 100 : 0;
                return (
                  <div key={c.name} className="category-row">
                    <div className="category-row-header">
                      <span>{c.name}</span>
                      <span>${c.total.toFixed(2)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 3. Budget progress */}
          {budgetSummary.length > 0 && (
            <div className="card section-card">
              <h3>Budget progress — {monthLabel} {year}</h3>
              {budgetSummary.map((b) => {
                const s = budgetStatus(b.percentUsed);
                return (
                  <div key={b.id} className="budget-row">
                    <div className="budget-row-header">
                      <span>{b.category?.name ?? "Overall"}</span>
                      <div className="budget-row-right">
                        <span className="status-label" style={{ color: s.color }}>{s.label}</span>
                        <span>${b.spent.toFixed(2)} / ${parseFloat(b.amount).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${Math.min(b.percentUsed, 100)}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Recent expenses */}
          <div className="card section-card">
            <h3>Recent expenses</h3>
            {recentExpenses.length === 0 ? (
              <p className="muted-text">No expenses yet.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th><th>Category</th><th>Payment</th><th>Date</th><th className="th-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <div>{e.title}</div>
                          {e.description && <div className="expense-desc">{e.description}</div>}
                        </td>
                        <td>{e.category ? <span className="badge">{e.category.name}</span> : "—"}</td>
                        <td className="payment-cell">{e.paymentMethod.replace("_", " ")}</td>
                        <td>{new Date(e.date).toLocaleDateString()}</td>
                        <td className="amount-cell">${parseFloat(e.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

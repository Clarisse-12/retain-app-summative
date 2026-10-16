import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { expenseApi, budgetApi } from "../services/api";
import type { Expense, BudgetSummaryItem } from "../types";
import { useAuth } from "../context/AuthContext";

const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();

function budgetStatus(pct: number) {
  if (pct >= 100) return { label: "Over budget", color: "var(--color-danger)" };
  if (pct >= 80)  return { label: "Approaching", color: "#f59e0b" };
  return { label: "Within budget", color: "var(--color-accent)" };
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const monthStart = new Date(year, month - 1, 1).toISOString();
    const monthEnd   = new Date(year, month, 1).toISOString();

    Promise.all([
      expenseApi.list({ limit: 5, sortBy: "date", order: "desc" }),
      expenseApi.list({ dateFrom: monthStart, dateTo: monthEnd, limit: 100 }),
      budgetApi.summary(month, year),
    ]).then(([recent, monthly, budRes]) => {
      setRecentExpenses(recent.expenses);
      setMonthExpenses(monthly.expenses);
      setBudgetSummary(budRes.summary);
      setTotalSpent(budRes.totalSpent);
    }).finally(() => setLoading(false));
  }, []);

  const totalBudgeted = budgetSummary.reduce((s, b) => s + parseFloat(b.amount), 0);
  const remaining = totalBudgeted - totalSpent;

  // Highest individual expense this month
  const highestExpense = monthExpenses.reduce<Expense | null>(
    (max, e) => !max || parseFloat(e.amount) > parseFloat(max.amount) ? e : max,
    null
  );

  // Spending by category this month
  const categorySpend: Record<string, { name: string; total: number }> = {};
  for (const e of monthExpenses) {
    const key = e.categoryId ?? "__none__";
    const name = e.category?.name ?? "Uncategorised";
    if (!categorySpend[key]) categorySpend[key] = { name, total: 0 };
    categorySpend[key].total += parseFloat(e.amount);
  }
  const categoryRows = Object.values(categorySpend).sort((a, b) => b.total - a.total);

  const overallPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const status = budgetStatus(overallPct);

  if (loading) return <Layout><div className="spinner" /></Layout>;

  return (
    <Layout>
      <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>
        Welcome back, {user?.name}
      </h2>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Spent this month</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary)" }}>${totalSpent.toFixed(2)}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Total budgeted</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-accent)" }}>${totalBudgeted.toFixed(2)}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Remaining</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: remaining < 0 ? "var(--color-danger)" : "var(--color-primary)" }}>
            ${remaining.toFixed(2)}
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Budget status</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: status.color }}>{status.label}</div>
        </div>
        {highestExpense && (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Highest expense</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-primary)" }}>${parseFloat(highestExpense.amount).toFixed(2)}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>{highestExpense.title}</div>
          </div>
        )}
      </div>

      {/* Spending by category */}
      {categoryRows.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>
            Spending by category — {now.toLocaleString("default", { month: "long" })} {year}
          </h3>
          {categoryRows.map((c) => {
            const pct = totalSpent > 0 ? (c.total / totalSpent) * 100 : 0;
            return (
              <div key={c.name} style={{ marginBottom: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                  <span>{c.name}</span>
                  <span>${c.total.toFixed(2)} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget progress */}
      {budgetSummary.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>
            Budget progress — {now.toLocaleString("default", { month: "long" })} {year}
          </h3>
          {budgetSummary.map((b) => {
            const s = budgetStatus(b.percentUsed);
            return (
              <div key={b.id} style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                  <span>{b.category?.name ?? "Overall"}</span>
                  <span style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: s.color }}>{s.label}</span>
                    <span>${b.spent.toFixed(2)} / ${parseFloat(b.amount).toFixed(2)}</span>
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{
                    width: `${Math.min(b.percentUsed, 100)}%`,
                    background: s.color,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent expenses */}
      <div className="card">
        <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Recent expenses</h3>
        {recentExpenses.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No expenses yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{e.category ? <span className="badge">{e.category.name}</span> : "—"}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>${parseFloat(e.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

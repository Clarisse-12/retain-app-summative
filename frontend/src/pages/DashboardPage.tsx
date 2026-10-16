import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { expenseApi, budgetApi } from "../services/api";
import type { Expense, BudgetSummaryItem } from "../types";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      expenseApi.list({ limit: 5, sortBy: "date", order: "desc" }),
      budgetApi.summary(month, year),
    ]).then(([expRes, budRes]) => {
      setRecentExpenses(expRes.expenses);
      setBudgetSummary(budRes.summary);
      setTotalSpent(budRes.totalSpent);
    }).finally(() => setLoading(false));
  }, [month, year]);

  const totalBudgeted = budgetSummary.reduce((s, b) => s + parseFloat(b.amount), 0);

  if (loading) return <Layout><div className="spinner" /></Layout>;

  return (
    <Layout>
      <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>
        Welcome back, {user?.name}
      </h2>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
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
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: totalBudgeted - totalSpent < 0 ? "var(--color-danger)" : "var(--color-primary)" }}>
            ${(totalBudgeted - totalSpent).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Budget progress */}
      {budgetSummary.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Budget progress — {now.toLocaleString("default", { month: "long" })} {year}</h3>
          {budgetSummary.map((b) => (
            <div key={b.id} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                <span>{b.category?.name ?? "Overall"}</span>
                <span>${b.spent.toFixed(2)} / ${parseFloat(b.amount).toFixed(2)}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(b.percentUsed, 100)}%`,
                    background: b.percentUsed >= 100 ? "var(--color-danger)" : "var(--color-accent)",
                  }}
                />
              </div>
            </div>
          ))}
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
                    <td>
                      {e.category ? (
                        <span className="badge" style={{ background: e.category.color || "var(--color-primary)" }}>
                          {e.category.name}
                        </span>
                      ) : "—"}
                    </td>
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

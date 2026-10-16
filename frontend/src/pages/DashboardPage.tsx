import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { expenseApi, budgetApi } from "../services/api";
import type { Expense, BudgetSummaryItem } from "../types";
import { useAuth } from "../context/AuthContext";

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

  // ── Derived values ────────────────────────────────────────
  const totalBudgeted = budgetSummary.reduce((s, b) => s + parseFloat(b.amount), 0);
  const remaining     = totalBudgeted - totalSpent;
  const overallPct    = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const status        = budgetStatus(overallPct);

  // Highest individual expense for selected month
  const highestExpense = monthExpenses.reduce<Expense | null>(
    (max, e) => !max || parseFloat(e.amount) > parseFloat(max.amount) ? e : max,
    null
  );

  // Spending by category for selected month
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
      {/* Header + month picker */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ color: "var(--color-primary)", margin: 0 }}>
          Welcome back, {user?.name}
        </h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select className="form-input" style={{ width: 130 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select className="form-input" style={{ width: 90 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* ── 1. Summary cards ─────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>

            {/* Total spending */}
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
                Spent — {monthLabel} {year}
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 700, color: "var(--color-primary)" }}>
                ${totalSpent.toFixed(2)}
              </div>
            </div>

            {/* Total budgeted */}
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Total budgeted</div>
              <div style={{ fontSize: "1.7rem", fontWeight: 700, color: "var(--color-accent)" }}>
                ${totalBudgeted.toFixed(2)}
              </div>
            </div>

            {/* Remaining monthly budget */}
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Remaining budget</div>
              <div style={{ fontSize: "1.7rem", fontWeight: 700, color: remaining < 0 ? "var(--color-danger)" : "var(--color-primary)" }}>
                ${remaining.toFixed(2)}
              </div>
            </div>

            {/* Budget status */}
            {totalBudgeted > 0 && (
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Budget status</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: status.color }}>{status.label}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  {overallPct.toFixed(0)}% used
                </div>
              </div>
            )}

            {/* Highest individual expense */}
            {highestExpense ? (
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Highest expense</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)" }}>
                  ${parseFloat(highestExpense.amount).toFixed(2)}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                  {highestExpense.title}
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Highest expense</div>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>No expenses</div>
              </div>
            )}
          </div>

          {/* ── 2. Spending by category ───────────────────────── */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>
              Spending by category — {monthLabel} {year}
            </h3>
            {categoryRows.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", margin: 0 }}>No expenses recorded for this month.</p>
            ) : (
              categoryRows.map((c) => {
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
              })
            )}
          </div>

          {/* ── 3. Budget progress ───────────────────────────── */}
          {budgetSummary.length > 0 && (
            <div className="card" style={{ marginBottom: "2rem" }}>
              <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>
                Budget progress — {monthLabel} {year}
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
                      <div className="progress-bar-fill" style={{ width: `${Math.min(b.percentUsed, 100)}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 4. Recent expenses ───────────────────────────── */}
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
                      <th>Payment</th>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <div>{e.title}</div>
                          {e.description && (
                            <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{e.description}</div>
                          )}
                        </td>
                        <td>{e.category ? <span className="badge">{e.category.name}</span> : "—"}</td>
                        <td style={{ fontSize: "0.82rem" }}>{e.paymentMethod.replace("_", " ")}</td>
                        <td>{new Date(e.date).toLocaleDateString()}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>${parseFloat(e.amount).toFixed(2)}</td>
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

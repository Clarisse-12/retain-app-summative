import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { adminApi } from "../services/api";
import type { AdminDashboardResponse, AdminInsightsResponse, AdminUser, RecentUser } from "../types";
import "../styles/AdminPage.css";

const now = new Date();
const YEARS = Array.from({ length: 9 }, (_, i) => now.getFullYear() - 3 + i);

export default function AdminPage() {
  const [month,     setMonth]     = useState(now.getMonth() + 1);
  const [year,      setYear]      = useState(now.getFullYear());
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [insights,  setInsights]  = useState<AdminInsightsResponse | null>(null);
  const [loading,   setLoading]   = useState(true);

  const loadDashboard = useCallback(() => {
    setLoading(true);
    Promise.all([adminApi.dashboard(month, year), adminApi.users(), adminApi.insights()])
      .then(([d, u, i]) => { setDashboard(d); setUsers(u.users); setInsights(i); })
      .finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) return <Layout><div className="spinner" /></Layout>;

  const stats = dashboard!.stats;
  const monthLabel = new Date(year, month - 1).toLocaleString("default", { month: "long" });

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 className="admin-header" style={{ margin: 0 }}>Admin Dashboard</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select className="form-input" style={{ width: 140 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString("default", { month: "long" })}</option>
            ))}
          </select>
          <select className="form-input" style={{ width: 100 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {[
          { label: "Total users",    value: stats.totalUsers },
          { label: "Total expenses", value: stats.totalExpenses },
          { label: `Expenses — ${monthLabel} ${year}`, value: stats.expensesThisMonth },
          { label: "Total value",    value: `$${Number(stats.totalExpenseValue).toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="card admin-stat-card">
            <div className="admin-stat-label">{s.label}</div>
            <div className="admin-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Top 5 / Bottom 5 */}
      <div className="admin-two-col">
        <div className="card admin-card">
          <h3>Top 5 categories</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Category</th><th className="th-right">Expenses</th><th className="th-right">Total</th></tr></thead>
              <tbody>
                {insights?.top5.map((s, i) => (
                  <tr key={i}>
                    <td>{s.category?.name ?? <span className="uncategorised">Uncategorised</span>}</td>
                    <td className="td-right">{s.expenseCount}</td>
                    <td className="td-right-bold">${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card admin-card">
          <h3>Bottom 5 categories</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Category</th><th className="th-right">Expenses</th><th className="th-right">Total</th></tr></thead>
              <tbody>
                {insights?.bottom5.map((s, i) => (
                  <tr key={i}>
                    <td>{s.category?.name ?? <span className="uncategorised">Uncategorised</span>}</td>
                    <td className="td-right">{s.expenseCount}</td>
                    <td className="td-right-bold">${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Spending by category + month */}
      <div className="admin-two-col">
        <div className="card admin-card">
          <h3>Spending by category</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Category</th><th className="th-right">Expenses</th><th className="th-right">Total</th></tr></thead>
              <tbody>
                {insights?.spendingByCategory.map((s, i) => (
                  <tr key={i}>
                    <td>{s.category?.name ?? <span className="uncategorised">Uncategorised</span>}</td>
                    <td className="td-right">{s.expenseCount}</td>
                    <td className="td-right-bold">${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card admin-card">
          <h3>Spending by month</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Month</th><th className="th-right">Expenses</th><th className="th-right">Total</th></tr></thead>
              <tbody>
                {insights?.spendingByMonth.map((s, i) => (
                  <tr key={i}>
                    <td>{s.month}</td>
                    <td className="td-right">{s.expenseCount}</td>
                    <td className="td-right-bold">${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recently registered users */}
      <div className="card admin-card">
        <h3>Recently registered users</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {(dashboard!.recentUsers as RecentUser[]).map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All users */}
      <div className="card admin-card">
        <h3>All users</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th>
                <th className="th-center">Expenses</th>
                <th className="th-center">Budgets</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>{u.role}</span></td>
                  <td className="td-center">{u._count.expenses}</td>
                  <td className="td-center">{u._count.budgets}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recently added expenses */}
      <div className="card">
        <h3>Recently added expenses</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Title</th><th>User</th><th>Category</th><th>Date</th><th className="th-right">Amount</th></tr></thead>
            <tbody>
              {dashboard!.recentExpenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td className="td-muted">{(e as any).user?.name ?? e.userId}</td>
                  <td>{e.category ? <span className="badge">{e.category.name}</span> : <span className="badge badge-neutral">Uncategorised</span>}</td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td className="td-right-bold">${parseFloat(e.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

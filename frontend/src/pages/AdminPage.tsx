import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { adminApi } from "../services/api";
import type { AdminDashboardResponse, AdminInsightsResponse, AdminUser, RecentUser } from "../types";
import "../styles/AdminPage.css";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [insights,  setInsights]  = useState<AdminInsightsResponse | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.users(), adminApi.insights()])
      .then(([d, u, i]) => { setDashboard(d); setUsers(u.users); setInsights(i); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="spinner" /></Layout>;

  const stats = dashboard!.stats;

  return (
    <Layout>
      <h2 className="admin-header">Admin Dashboard</h2>

      {/* Stats */}
      <div className="admin-stats-grid">
        {[
          { label: "Total users",    value: stats.totalUsers },
          { label: "Total expenses", value: stats.totalExpenses },
          { label: "This month",     value: stats.expensesThisMonth },
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
                  <td>{e.category ? <span className="badge">{e.category.name}</span> : "—"}</td>
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

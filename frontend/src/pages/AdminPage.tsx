import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { adminApi } from "../services/api";
import type { AdminDashboardResponse, AdminInsightsResponse, AdminUser } from "../types";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [insights, setInsights] = useState<AdminInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.users(), adminApi.insights()])
      .then(([d, u, i]) => {
        setDashboard(d);
        setUsers(u.users);
        setInsights(i);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="spinner" /></Layout>;

  return (
    <Layout>
      <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Admin Dashboard</h2>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Total users</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary)" }}>{dashboard?.stats.totalUsers}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Total expenses</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary)" }}>{dashboard?.stats.totalExpenses}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Total value</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-accent)" }}>
            ${Number(dashboard?.stats.totalExpenseValue ?? 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Recent expenses */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Recent expenses (all users)</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>User</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentExpenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{e.userId}</td>
                  <td>
                    {e.category
                      ? <span className="badge">{e.category.name}</span>
                      : "—"}
                  </td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>${parseFloat(e.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Users</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: "center" }}>Expenses</th>
                <th style={{ textAlign: "center" }}>Budgets</th>
                <th style={{ textAlign: "center" }}>Categories</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge" style={{ background: u.role === "ADMIN" ? "var(--color-primary)" : "var(--color-accent)" }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>{u._count.expenses}</td>
                  <td style={{ textAlign: "center" }}>{u._count.budgets}</td>
                  <td style={{ textAlign: "center" }}>{u._count.categories}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spending by category */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Spending by category</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: "right" }}>Expenses</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {insights?.spendingByCategory.map((s, i) => (
                  <tr key={i}>
                    <td>
                      {s.category
                        ? <span>{s.category.name}</span>
                        : <span style={{ color: "var(--color-text-muted)" }}>Uncategorised</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>{s.expenseCount}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spending by month */}
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Spending by month</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{ textAlign: "right" }}>Expenses</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {insights?.spendingByMonth.map((s, i) => (
                  <tr key={i}>
                    <td>{s.month}</td>
                    <td style={{ textAlign: "right" }}>{s.expenseCount}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

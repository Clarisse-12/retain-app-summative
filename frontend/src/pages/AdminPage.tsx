import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { adminApi, categoryApi } from "../services/api";
import type { AdminDashboardResponse, AdminInsightsResponse, AdminUser, RecentUser } from "../types";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [insights, setInsights] = useState<AdminInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Category management state
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [catName, setCatName] = useState("");
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);
  const [catError, setCatError] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  const loadAll = () =>
    Promise.all([adminApi.dashboard(), adminApi.users(), adminApi.insights(), categoryApi.list()])
      .then(([d, u, i, c]) => {
        setDashboard(d);
        setUsers(u.users);
        setInsights(i);
        setCategories(c.categories);
      })
      .finally(() => setLoading(false));

  useEffect(() => { loadAll(); }, []);

  const openEditCat = (c: { id: string; name: string }) => { setEditingCat(c); setCatName(c.name); setCatError(""); };
  const closeCatForm = () => { setEditingCat(null); setCatName(""); setCatError(""); };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError("");
    setCatSaving(true);
    try {
      if (editingCat) await categoryApi.update(editingCat.id, { name: catName });
      else await categoryApi.create({ name: catName });
      await loadAll();
      closeCatForm();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setCatError(e.response?.data?.message ?? "Failed to save");
    } finally {
      setCatSaving(false);
    }
  };

  const handleCatDelete = async (id: string) => {
    if (!confirm("Delete this category? Affected expenses will become uncategorised.")) return;
    try {
      await categoryApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setCatError(e.response?.data?.message ?? "Failed to delete category");
    }
  };

  if (loading) return <Layout><div className="spinner" /></Layout>;

  const stats = dashboard!.stats;

  return (
    <Layout>
      <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Admin Dashboard</h2>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total users", value: stats.totalUsers },
          { label: "Total expenses", value: stats.totalExpenses },
          { label: "This month", value: stats.expensesThisMonth },
          { label: "Total value", value: `$${Number(stats.totalExpenseValue).toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>{s.label}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-primary)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Category management */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Manage categories</h3>
        <form onSubmit={handleCatSubmit} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <input
            className="form-input"
            style={{ flex: "1 1 200px" }}
            placeholder={editingCat ? "Edit name…" : "New category name…"}
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={catSaving}>{editingCat ? "Update" : "Add"}</button>
          {editingCat && <button type="button" className="btn btn-secondary" onClick={closeCatForm}>Cancel</button>}
        </form>
        {catError && <div className="alert alert-error" style={{ marginBottom: "0.75rem" }}>{catError}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {categories.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 6, padding: "0.3rem 0.6rem" }}>
              <span style={{ fontSize: "0.9rem" }}>{c.name}</span>
              <button className="btn btn-secondary" style={{ padding: "0.1rem 0.4rem", fontSize: "0.75rem" }} onClick={() => openEditCat(c)}>Edit</button>
              <button className="btn btn-danger" style={{ padding: "0.1rem 0.4rem", fontSize: "0.75rem" }} onClick={() => handleCatDelete(c.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 / Bottom 5 categories */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Top 5 categories</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Category</th><th style={{ textAlign: "right" }}>Expenses</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
              <tbody>
                {insights?.top5.map((s, i) => (
                  <tr key={i}>
                    <td>{s.category?.name ?? <span style={{ color: "var(--color-text-muted)" }}>Uncategorised</span>}</td>
                    <td style={{ textAlign: "right" }}>{s.expenseCount}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Bottom 5 categories</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Category</th><th style={{ textAlign: "right" }}>Expenses</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
              <tbody>
                {insights?.bottom5.map((s, i) => (
                  <tr key={i}>
                    <td>{s.category?.name ?? <span style={{ color: "var(--color-text-muted)" }}>Uncategorised</span>}</td>
                    <td style={{ textAlign: "right" }}>{s.expenseCount}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Spending by category + month */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Spending by category</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Category</th><th style={{ textAlign: "right" }}>Expenses</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
              <tbody>
                {insights?.spendingByCategory.map((s, i) => (
                  <tr key={i}>
                    <td>{s.category?.name ?? <span style={{ color: "var(--color-text-muted)" }}>Uncategorised</span>}</td>
                    <td style={{ textAlign: "right" }}>{s.expenseCount}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>${Number(s.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Spending by month</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Month</th><th style={{ textAlign: "right" }}>Expenses</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
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

      {/* Recently registered users */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Recently registered users</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {(dashboard!.recentUsers as RecentUser[]).map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge" style={{ background: u.role === "ADMIN" ? "var(--color-primary)" : "var(--color-accent)" }}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All users */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>All users</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th>
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
                  <td><span className="badge" style={{ background: u.role === "ADMIN" ? "var(--color-primary)" : "var(--color-accent)" }}>{u.role}</span></td>
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

      {/* Recent expenses */}
      <div className="card">
        <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Recently added expenses</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Title</th><th>User</th><th>Category</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              {dashboard!.recentExpenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{(e as any).user?.name ?? e.userId}</td>
                  <td>{e.category ? <span className="badge">{e.category.name}</span> : "—"}</td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>${parseFloat(e.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

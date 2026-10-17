import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { budgetApi, categoryApi } from "../services/api";
import type { BudgetSummaryItem, Category, CreateBudgetInput } from "../types";

const now = new Date();
// Generate a list of years from 3 years ago to 5 years in the future
const YEARS = Array.from({ length: 9 }, (_, i) => now.getFullYear() - 3 + i);

type MonthContext = "past" | "current" | "future";

function getMonthContext(month: number, year: number): MonthContext {
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  if (year < nowYear || (year === nowYear && month < nowMonth)) return "past";
  if (year === nowYear && month === nowMonth) return "current";
  return "future";
}

function budgetStatus(pct: number, ctx: MonthContext) {
  // Past month → always over budget if spent more than budgeted
  if (ctx === "past" && pct < 100) return { label: "Over budget", color: "var(--color-danger)" };
  // Future month → always approaching if budgeted at all
  if (ctx === "future") return { label: "Approaching", color: "#f59e0b" };
  // Current month → use thresholds
  if (pct >= 100) return { label: "Over budget", color: "var(--color-danger)" };
  if (pct >= 80)  return { label: "Approaching", color: "#f59e0b" };
  return { label: "Within budget", color: "var(--color-accent)" };
}

export default function BudgetsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<BudgetSummaryItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BudgetSummaryItem | null>(null);
  const [form, setForm] = useState<CreateBudgetInput>({ amount: 0, month, year, categoryId: null });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    budgetApi.summary(month, year)
      .then((r) => { setSummary(r.summary); setTotalSpent(r.totalSpent); })
      .finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { categoryApi.list().then((r) => setCategories(r.categories)); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ amount: 0, month, year, categoryId: null });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (b: BudgetSummaryItem) => {
    setEditing(b);
    setForm({ amount: parseFloat(b.amount), month: b.month, year: b.year, categoryId: b.categoryId });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editing) await budgetApi.update(editing.id, form);
      else await budgetApi.create(form);
      load();
      closeForm();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e.response?.data?.message ?? "Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget?")) return;
    await budgetApi.delete(id);
    load();
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });
  const totalBudgeted = summary.reduce((s, b) => s + parseFloat(b.amount), 0);
  const ctx = getMonthContext(month, year);
  const years = YEARS;

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ color: "var(--color-primary)" }}>Budgets</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New budget</button>
      </div>

      {/*month/year selector and context label*/}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <select className="form-input" style={{ width: 140 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select className="form-input" style={{ width: 100 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{
          fontSize: "0.8rem", fontWeight: 600, padding: "0.25rem 0.6rem", borderRadius: 4,
          background: ctx === "past" ? "var(--color-danger)" : ctx === "future" ? "#f59e0b" : "var(--color-accent)",
          color: "#fff",
        }}>
          {ctx === "past" ? "Past" : ctx === "future" ? "Future" : "Current month"}
        </span>
      </div>

      {/*summary cards*/}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Total budgeted</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-accent)" }}>${totalBudgeted.toFixed(2)}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Spent</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-primary)" }}>${totalSpent.toFixed(2)}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Remaining</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: totalBudgeted - totalSpent < 0 ? "var(--color-danger)" : "var(--color-primary)" }}>
            ${(totalBudgeted - totalSpent).toFixed(2)}
          </div>
        </div>
        {totalBudgeted > 0 && (() => {
          const s = budgetStatus(totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0, ctx);
          return (
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Overall status</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: s.color }}>{s.label}</div>
            </div>
          );
        })()}
      </div>

      {/*form*/}
      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem", maxWidth: 420 }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>{editing ? "Edit budget" : "New budget"}</h3>
          {formError && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount ($)</label>
              <input type="number" min="0.01" step="0.01" className="form-input"
                value={form.amount || ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) }))}
                required autoFocus />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Month</label>
                <select className="form-input" value={form.month}
                  onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString("default", { month: "short" })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Year</label>
                <select className="form-input" value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={form.categoryId ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value || null }))}>
                <option value="">Overall (no category)</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/*budget list*/}
      {loading ? <div className="spinner" /> : summary.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No budgets for {monthName} {year}.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {summary.map((b) => {
            const s = budgetStatus(b.percentUsed, ctx);
            return (
            <div key={b.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                    {b.category ? <span>{b.category.name}</span> : "Overall"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                    ${b.spent.toFixed(2)} spent of ${parseFloat(b.amount).toFixed(2)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: s.color }}>{s.label}</span>
                  <button className="btn btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }} onClick={() => openEdit(b)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleDelete(b.id)}>Delete</button>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{
                  width: `${Math.min(b.percentUsed, 100)}%`,
                  background: s.color,
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: "0.4rem", color: "var(--color-text-muted)" }}>
                <span>{b.percentUsed.toFixed(0)}% used</span>
                <span>${b.remaining.toFixed(2)} remaining</span>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

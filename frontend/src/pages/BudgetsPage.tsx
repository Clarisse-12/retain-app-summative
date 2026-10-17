import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { budgetApi, categoryApi } from "../services/api";
import type { BudgetSummaryItem, Category, CreateBudgetInput } from "../types";
import "../styles/BudgetsPage.css";

const now = new Date();
const YEARS = Array.from({ length: 9 }, (_, i) => now.getFullYear() - 3 + i);

type MonthContext = "past" | "current" | "future";

function getMonthContext(month: number, year: number): MonthContext {
  const nowYear  = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  if (year < nowYear || (year === nowYear && month < nowMonth)) return "past";
  if (year === nowYear && month === nowMonth) return "current";
  return "future";
}

function budgetStatus(pct: number, ctx: MonthContext) {
  if (ctx === "past"   && pct < 100) return { label: "Over budget",   color: "var(--color-danger)" };
  if (ctx === "future")              return { label: "Approaching",   color: "#f59e0b" };
  if (pct >= 100) return { label: "Over budget",   color: "var(--color-danger)" };
  if (pct >= 80)  return { label: "Approaching",   color: "#f59e0b" };
  return              { label: "Within budget", color: "var(--color-accent)" };
}

export default function BudgetsPage() {
  const [month,     setMonth]     = useState(now.getMonth() + 1);
  const [year,      setYear]      = useState(now.getFullYear());
  const [summary,   setSummary]   = useState<BudgetSummaryItem[]>([]);
  const [totalSpent,setTotalSpent]= useState(0);
  const [categories,setCategories]= useState<Category[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<BudgetSummaryItem | null>(null);
  const [form,      setForm]      = useState<CreateBudgetInput>({ amount: 0, month, year, categoryId: null });
  const [formError, setFormError] = useState("");
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    budgetApi.summary(month, year)
      .then((r) => { setSummary(r.summary); setTotalSpent(r.totalSpent); })
      .finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { categoryApi.list().then((r) => setCategories(r.categories)); }, []);

  const openCreate = () => { setEditing(null); setForm({ amount: 0, month, year, categoryId: null }); setFormError(""); setShowForm(true); };
  const openEdit   = (b: BudgetSummaryItem) => { setEditing(b); setForm({ amount: parseFloat(b.amount), month: b.month, year: b.year, categoryId: b.categoryId }); setFormError(""); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editing) await budgetApi.update(editing.id, form);
      else         await budgetApi.create(form);
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

  const monthName    = new Date(year, month - 1).toLocaleString("default", { month: "long" });
  const totalBudgeted = summary.reduce((s, b) => s + parseFloat(b.amount), 0);
  const ctx          = getMonthContext(month, year);

  return (
    <Layout>
      <div className="budgets-header">
        <h2>Budgets</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New budget</button>
      </div>

      {/* Month/year picker */}
      <div className="month-picker">
        <select className="form-input picker-select-month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select className="form-input picker-select-year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className={`context-badge ${ctx}`}>
          {ctx === "past" ? "Past" : ctx === "future" ? "Future" : "Current month"}
        </span>
      </div>

      {/* Summary cards */}
      <div className="budget-stats-grid">
        <div className="card budget-stat-card">
          <div className="budget-stat-label">Total budgeted</div>
          <div className="budget-stat-value accent">${totalBudgeted.toFixed(2)}</div>
        </div>
        <div className="card budget-stat-card">
          <div className="budget-stat-label">Spent</div>
          <div className="budget-stat-value">${totalSpent.toFixed(2)}</div>
        </div>
        <div className="card budget-stat-card">
          <div className="budget-stat-label">Remaining</div>
          <div className={`budget-stat-value${totalBudgeted - totalSpent < 0 ? " danger" : ""}`}>
            ${(totalBudgeted - totalSpent).toFixed(2)}
          </div>
        </div>
        {totalBudgeted > 0 && (() => {
          const s = budgetStatus(totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0, ctx);
          return (
            <div className="card budget-stat-card">
              <div className="budget-stat-label">Overall status</div>
              <div className="budget-stat-value status" style={{ color: s.color }}>{s.label}</div>
            </div>
          );
        })()}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card budget-form-card">
          <h3>{editing ? "Edit budget" : "New budget"}</h3>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount ($)</label>
              <input type="number" min="0.01" step="0.01" className="form-input"
                value={form.amount || ""} onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) }))}
                required autoFocus />
            </div>
            <div className="budget-form-row">
              <div className="form-group">
                <label>Month</label>
                <select className="form-input" value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString("default", { month: "short" })}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select className="form-input" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
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
            <div className="budget-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Budget list */}
      {loading ? <div className="spinner" /> : summary.length === 0 ? (
        <p className="no-budgets">No budgets for {monthName} {year}.</p>
      ) : (
        <div className="budget-list">
          {summary.map((b) => {
            const s = budgetStatus(b.percentUsed, ctx);
            return (
              <div key={b.id} className="card">
                <div className="budget-item-header">
                  <div>
                    <div className="budget-item-name">{b.category?.name ?? "Overall"}</div>
                    <div className="budget-item-spent">${b.spent.toFixed(2)} spent of ${parseFloat(b.amount).toFixed(2)}</div>
                  </div>
                  <div className="budget-item-actions">
                    <span className="budget-status-label" style={{ color: s.color }}>{s.label}</span>
                    <button className="btn btn-secondary btn-sm-action" onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn btn-danger btn-sm-action" onClick={() => handleDelete(b.id)}>Delete</button>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(b.percentUsed, 100)}%`, background: s.color }} />
                </div>
                <div className="budget-item-footer">
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

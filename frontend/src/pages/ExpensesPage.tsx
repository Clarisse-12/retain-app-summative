import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { expenseApi, categoryApi } from "../services/api";
import { useAppDispatch, useAppSelector } from "../store";
import { setFilters, setPage, resetFilters } from "../store/filtersSlice";
import type { Expense, Category, CreateExpenseInput, ApiError } from "../types";

const EMPTY_FORM: CreateExpenseInput = { title: "", amount: 0, description: "", categoryId: null };

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<CreateExpenseInput>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    expenseApi.list(filters)
      .then((r) => { setExpenses(r.expenses); setTotalPages(r.pagination.totalPages); })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { categoryApi.list().then((r) => setCategories(r.categories)); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description ?? "",
      amount: parseFloat(e.amount),
      date: e.date.slice(0, 10),
      categoryId: e.categoryId,
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = { ...form, date: form.date ? new Date(form.date).toISOString() : undefined };
      if (editing) await expenseApi.update(editing.id, payload);
      else await expenseApi.create(payload);
      load();
      closeForm();
    } catch (err) {
      const e = err as { response?: { data?: ApiError } };
      setFormError(e.response?.data?.message ?? "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    await expenseApi.delete(id);
    load();
  };

  const handleSort = (col: "date" | "amount" | "title") => {
    if (filters.sortBy === col) dispatch(setFilters({ order: filters.order === "asc" ? "desc" : "asc" }));
    else dispatch(setFilters({ sortBy: col, order: "desc" }));
  };

  const sortArrow = (col: string) => filters.sortBy === col ? (filters.order === "asc" ? " ▲" : " ▼") : "";

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ color: "var(--color-primary)" }}>Expenses</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New expense</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "flex-end" }}>
        <div className="form-group" style={{ margin: 0, flex: "1 1 160px" }}>
          <label>Search</label>
          <input className="form-input" placeholder="Title…" value={filters.search ?? ""}
            onChange={(e) => dispatch(setFilters({ search: e.target.value || undefined }))} />
        </div>
        <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
          <label>Category</label>
          <select className="form-input" value={filters.categoryId ?? ""}
            onChange={(e) => dispatch(setFilters({ categoryId: e.target.value || undefined }))}>
            <option value="">All</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0, flex: "1 1 130px" }}>
          <label>From</label>
          <input type="date" className="form-input" value={filters.dateFrom ?? ""}
            onChange={(e) => dispatch(setFilters({ dateFrom: e.target.value || undefined }))} />
        </div>
        <div className="form-group" style={{ margin: 0, flex: "1 1 130px" }}>
          <label>To</label>
          <input type="date" className="form-input" value={filters.dateTo ?? ""}
            onChange={(e) => dispatch(setFilters({ dateTo: e.target.value || undefined }))} />
        </div>
        <button className="btn btn-secondary" onClick={() => dispatch(resetFilters())}>Reset</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: "1.25rem", maxWidth: 460 }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>{editing ? "Edit expense" : "New expense"}</h3>
          {formError && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input className="form-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required autoFocus />
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input type="number" min="0.01" step="0.01" className="form-input" value={form.amount || ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) }))} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-input" value={form.date ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={form.categoryId ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value || null }))}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input className="form-input" value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? <div className="spinner" /> : expenses.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No expenses found.</p>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>Title{sortArrow("title")}</th>
                  <th>Category</th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("date")}>Date{sortArrow("date")}</th>
                  <th style={{ cursor: "pointer", textAlign: "right" }} onClick={() => handleSort("amount")}>Amount{sortArrow("amount")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div>{e.title}</div>
                      {e.description && <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{e.description}</div>}
                    </td>
                    <td>
                      {e.category
                        ? <span className="badge" style={{ background: e.category.color || "var(--color-primary)" }}>{e.category.name}</span>
                        : "—"}
                    </td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>${parseFloat(e.amount).toFixed(2)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button className="btn btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem", marginRight: "0.25rem" }} onClick={() => openEdit(e)}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }} onClick={() => handleDelete(e.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: "1rem" }}>
          <button className="btn btn-secondary" disabled={filters.page === 1} onClick={() => dispatch(setPage(filters.page - 1))}>‹ Prev</button>
          <span style={{ padding: "0 0.75rem", lineHeight: "2rem" }}>Page {filters.page} of {totalPages}</span>
          <button className="btn btn-secondary" disabled={filters.page === totalPages} onClick={() => dispatch(setPage(filters.page + 1))}>Next ›</button>
        </div>
      )}
    </Layout>
  );
}

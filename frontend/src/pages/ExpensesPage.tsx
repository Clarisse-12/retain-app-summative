import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import { expenseApi, categoryApi } from "../services/api";
import { useAppDispatch, useAppSelector } from "../store";
import { setFilters, setPage, resetFilters } from "../store/filtersSlice";
import type { Expense, Category, CreateExpenseInput, PaymentMethod } from "../types";
import "../styles/ExpensesPage.css";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH",           label: "Cash" },
  { value: "CARD",           label: "Card" },
  { value: "BANK_TRANSFER",  label: "Bank Transfer" },
  { value: "MOBILE_PAYMENT", label: "Mobile Payment" },
  { value: "OTHER",          label: "Other" },
];

const EMPTY_FORM: CreateExpenseInput = { title: "", amount: 0, description: "", categoryId: null, paymentMethod: "CARD" };

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters  = useAppSelector((s) => s.filters);

  const [expenses,   setExpenses]   = useState<Expense[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<Expense | null>(null);
  const [form,       setForm]       = useState<CreateExpenseInput>(EMPTY_FORM);
  const [formError,  setFormError]  = useState("");
  const [saving,     setSaving]     = useState(false);

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
      title: e.title, description: e.description ?? "",
      amount: parseFloat(e.amount), date: e.date.slice(0, 10),
      categoryId: e.categoryId, paymentMethod: e.paymentMethod,
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
      else         await expenseApi.create(payload);
      load();
      closeForm();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
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
      <div className="page-header">
        <h2>Expenses</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New expense</button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="form-group filter-group">
          <label>Search</label>
          <input className="form-input" placeholder="Title…" value={filters.search ?? ""}
            onChange={(e) => dispatch(setFilters({ search: e.target.value || undefined }))} />
        </div>
        <div className="form-group filter-group-cat">
          <label>Category</label>
          <select className="form-input" value={filters.categoryId ?? ""}
            onChange={(e) => dispatch(setFilters({ categoryId: e.target.value || undefined }))}>
            <option value="">All</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group filter-group-cat">
          <label>Payment</label>
          <select className="form-input" value={filters.paymentMethod ?? ""}
            onChange={(e) => dispatch(setFilters({ paymentMethod: e.target.value || undefined }))}>
            <option value="">All</option>
            {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="form-group filter-group-md">
          <label>From</label>
          <input type="date" className="form-input" value={filters.dateFrom ?? ""}
            onChange={(e) => dispatch(setFilters({ dateFrom: e.target.value || undefined }))} />
        </div>
        <div className="form-group filter-group-md">
          <label>To</label>
          <input type="date" className="form-input" value={filters.dateTo ?? ""}
            onChange={(e) => dispatch(setFilters({ dateTo: e.target.value || undefined }))} />
        </div>
        <div className="form-group filter-group-sm">
          <label>Min ($)</label>
          <input type="number" min="0" step="0.01" className="form-input" value={filters.amountMin ?? ""}
            onChange={(e) => dispatch(setFilters({ amountMin: e.target.value ? parseFloat(e.target.value) : undefined }))} />
        </div>
        <div className="form-group filter-group-sm">
          <label>Max ($)</label>
          <input type="number" min="0" step="0.01" className="form-input" value={filters.amountMax ?? ""}
            onChange={(e) => dispatch(setFilters({ amountMax: e.target.value ? parseFloat(e.target.value) : undefined }))} />
        </div>
        <button className="btn btn-secondary" onClick={() => dispatch(resetFilters())}>Reset</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card form-card">
          <h3>{editing ? "Edit expense" : "New expense"}</h3>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input className="form-input" value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required autoFocus />
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
              <label>Payment Method</label>
              <select className="form-input" value={form.paymentMethod ?? "CARD"}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}>
                {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input className="form-input" value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? <div className="spinner" /> : expenses.length === 0 ? (
        <p className="no-results">No expenses found.</p>
      ) : (
        <div className="card table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="th-sortable" onClick={() => handleSort("title")}>Title{sortArrow("title")}</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th className="th-sortable" onClick={() => handleSort("date")}>Date{sortArrow("date")}</th>
                  <th className="th-amount" onClick={() => handleSort("amount")}>Amount{sortArrow("amount")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div>{e.title}</div>
                      {e.description && <div className="td-desc">{e.description}</div>}
                    </td>
                    <td>{e.category ? <span className="badge">{e.category.name}</span> : "—"}</td>
                    <td className="td-payment">{PAYMENT_METHODS.find(p => p.value === e.paymentMethod)?.label ?? e.paymentMethod}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td className="td-amount">${parseFloat(e.amount).toFixed(2)}</td>
                    <td className="td-actions">
                      <button className="btn btn-secondary btn-table btn-table-edit" onClick={() => openEdit(e)}>Edit</button>
                      <button className="btn btn-danger btn-table" onClick={() => handleDelete(e.id)}>Delete</button>
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
        <div className="pagination pagination-bar">
          <button className="btn btn-secondary" disabled={filters.page === 1} onClick={() => dispatch(setPage(filters.page - 1))}>‹ Prev</button>
          <span className="pagination-info">Page {filters.page} of {totalPages}</span>
          <button className="btn btn-secondary" disabled={filters.page === totalPages} onClick={() => dispatch(setPage(filters.page + 1))}>Next ›</button>
        </div>
      )}
    </Layout>
  );
}

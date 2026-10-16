import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { categoryApi } from "../services/api";
import type { Category, ApiError } from "../types";

const DEFAULT_COLOR = "#6366f1";

interface FormState { name: string; color: string; }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", color: DEFAULT_COLOR });
  const [saving, setSaving] = useState(false);

  const load = () =>
    categoryApi.list().then((r) => setCategories(r.categories)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", color: DEFAULT_COLOR }); setShowForm(true); setError(""); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, color: c.color || DEFAULT_COLOR }); setShowForm(true); setError(""); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.update(editing.id, form);
      } else {
        await categoryApi.create(form);
      }
      await load();
      closeForm();
    } catch (err) {
      const e = err as { response?: { data?: ApiError } };
      setError(e.response?.data?.message ?? "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Expenses will become uncategorised.")) return;
    try {
      await categoryApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete category");
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--color-primary)" }}>Categories</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New category</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem", maxWidth: 420 }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>{editing ? "Edit category" : "New category"}</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cat-name">Name</label>
              <input
                id="cat-name"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="cat-color">Color</label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  id="cat-color"
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  style={{ width: 40, height: 36, padding: 2, border: "1px solid var(--color-border)", borderRadius: 6, cursor: "pointer" }}
                />
                <input
                  className="form-input"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  pattern="^#[0-9a-fA-F]{6}$"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : categories.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No categories yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {categories.map((c) => (
            <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: c.color || DEFAULT_COLOR,
                flexShrink: 0,
              }} />
              <span style={{ flex: 1, fontWeight: 500 }}>{c.name}</span>
              <button className="btn btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem" }} onClick={() => openEdit(c)}>Edit</button>
              <button className="btn btn-danger" style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem" }} onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

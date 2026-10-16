import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { categoryApi } from "../services/api";
import type { Category } from "../types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    categoryApi.list().then((r) => setCategories(r.categories)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setName(""); setError(""); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setError(""); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) await categoryApi.update(editing.id, { name });
      else await categoryApi.create({ name });
      await load();
      closeForm();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
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
              <input id="cat-name" className="form-input" value={name}
                onChange={(e) => setName(e.target.value)} required autoFocus />
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

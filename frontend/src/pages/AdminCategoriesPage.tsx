import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { categoryApi } from "../services/api";
import "../styles/AdminCategoriesPage.css";

interface Cat { id: string; name: string; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [name,       setName]       = useState("");
  const [editing,    setEditing]    = useState<Cat | null>(null);
  const [error,      setError]      = useState("");
  const [saving,     setSaving]     = useState(false);

  const load = () =>
    categoryApi.list()
      .then((r) => setCategories(r.categories))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openEdit  = (c: Cat) => { setEditing(c); setName(c.name); setError(""); };
  const closeForm = () => { setEditing(null); setName(""); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) await categoryApi.update(editing.id, { name });
      else         await categoryApi.create({ name });
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
    if (!confirm("Delete this category? Affected expenses will become uncategorised.")) return;
    try {
      await categoryApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to delete category");
    }
  };

  return (
    <Layout>
      <h2 className="categories-header">Manage Categories</h2>

      {/* Form */}
      <div className="card categories-form-card">
        <h3>{editing ? `Edit "${editing.name}"` : "New category"}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="categories-form">
          <input
            className="form-input categories-form-input"
            placeholder="Category name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
          )}
        </form>
      </div>

      {/* List */}
      {loading ? <div className="spinner" /> : categories.length === 0 ? (
        <p className="no-categories">No categories yet. Add one above.</p>
      ) : (
        <div className="card categories-table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th /></tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="td-name">{c.name}</td>
                    <td className="td-cat-actions">
                      <button className="btn btn-secondary btn-cat-edit" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-cat-delete" onClick={() => handleDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}

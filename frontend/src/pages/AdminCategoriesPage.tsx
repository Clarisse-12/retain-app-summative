import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { categoryApi } from "../services/api";

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

  const openEdit = (c: Cat) => { setEditing(c); setName(c.name); setError(""); };
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
      <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Manage Categories</h2>

      {/* Create / Edit form */}
      <div className="card" style={{ marginBottom: "2rem", maxWidth: 480 }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>
          {editing ? `Edit "${editing.name}"` : "New category"}
        </h3>
        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            className="form-input"
            style={{ flex: "1 1 200px" }}
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

      {/* Category list */}
      {loading ? <div className="spinner" /> : categories.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No categories yet. Add one above.</p>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.2rem 0.55rem", fontSize: "0.8rem", marginRight: "0.4rem" }}
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "0.2rem 0.55rem", fontSize: "0.8rem" }}
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
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

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MOCK_EXPENSES = [
  { id: "1", title: "Grocery run", category: { name: "Food", color: "#22c55e" }, date: "2025-07-10", amount: "84.50" },
  { id: "2", title: "Monthly rent", category: { name: "Housing", color: "#3b82f6" }, date: "2025-07-01", amount: "1200.00" },
  { id: "3", title: "Bus pass", category: { name: "Transport", color: "#f59e0b" }, date: "2025-07-05", amount: "45.00" },
  { id: "4", title: "Netflix", category: { name: "Entertainment", color: "#a855f7" }, date: "2025-07-08", amount: "15.99" },
  { id: "5", title: "Gym membership", category: { name: "Health", color: "#ef4444" }, date: "2025-07-03", amount: "40.00" },
];

const MOCK_BUDGETS = [
  { name: "Food", color: "#22c55e", spent: 210, budget: 300 },
  { name: "Housing", color: "#3b82f6", spent: 1200, budget: 1200 },
  { name: "Transport", color: "#f59e0b", spent: 45, budget: 150 },
  { name: "Entertainment", color: "#a855f7", spent: 55, budget: 80 },
];

export default function LandingPage() {
  const { mockLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemo = () => {
    mockLogin();
    navigate("/dashboard");
  };

  const totalSpent = 1385.49;
  const totalBudgeted = 1730;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Nav */}
      <header style={{ background: "var(--color-primary)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem" }}>Retain</span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "#fff" }} onClick={() => navigate("/login")}>Sign in</button>
          <button className="btn btn-primary" style={{ background: "var(--color-accent)" }} onClick={() => navigate("/register")}>Get started</button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "4rem 1rem 2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: "1rem" }}>
          Track expenses.<br />Stay on budget.
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem", marginBottom: "2rem", maxWidth: 480, margin: "0 auto 2rem" }}>
          Retain helps you log expenses, set budgets, and understand your spending — all in one place.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }} onClick={() => navigate("/register")}>Create free account</button>
          <button className="btn btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }} onClick={handleDemo}>Preview dashboard →</button>
        </div>
      </section>

      {/* Mock dashboard preview */}
      <section style={{ maxWidth: 900, margin: "3rem auto", padding: "0 1rem" }}>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {/* Fake browser bar */}
          <div style={{ background: "#f1f5f9", padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ marginLeft: "0.75rem", fontSize: "0.8rem", color: "#94a3b8" }}>retain-app · Dashboard</span>
          </div>

          <div style={{ display: "flex" }}>
            {/* Fake sidebar */}
            <div style={{ width: 160, background: "var(--color-primary)", padding: "1.25rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div style={{ color: "#fff", fontWeight: 700, marginBottom: "1rem", paddingLeft: "0.5rem", fontSize: "0.95rem" }}>Retain</div>
              {["Dashboard", "Expenses", "Budgets", "Categories"].map((item, i) => (
                <div key={item} style={{ padding: "0.5rem 0.75rem", borderRadius: 6, background: i === 0 ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontSize: "0.85rem", fontWeight: i === 0 ? 600 : 400 }}>{item}</div>
              ))}
            </div>

            {/* Fake content */}
            <div style={{ flex: 1, padding: "1.25rem", background: "var(--color-bg)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "1rem", fontSize: "1rem" }}>Welcome back, Alex</div>

              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
                {[
                  { label: "Spent this month", value: `$${totalSpent.toFixed(2)}`, color: "var(--color-primary)" },
                  { label: "Total budgeted", value: `$${totalBudgeted.toFixed(2)}`, color: "var(--color-accent)" },
                  { label: "Remaining", value: `$${(totalBudgeted - totalSpent).toFixed(2)}`, color: "var(--color-primary)" },
                ].map((c) => (
                  <div key={c.label} style={{ background: "#fff", borderRadius: 8, padding: "0.75rem", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>{c.label}</div>
                    <div style={{ fontWeight: 700, color: c.color, fontSize: "1.1rem" }}>{c.value}</div>
                  </div>
                ))}
              </div>

              {/* Budget bars */}
              <div style={{ background: "#fff", borderRadius: 8, padding: "0.75rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--color-primary)", marginBottom: "0.6rem" }}>Budget progress — July 2025</div>
                {MOCK_BUDGETS.map((b) => {
                  const pct = Math.min((b.spent / b.budget) * 100, 100);
                  return (
                    <div key={b.name} style={{ marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.2rem" }}>
                        <span>{b.name}</span>
                        <span>${b.spent} / ${b.budget}</span>
                      </div>
                      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "var(--color-danger)" : b.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent expenses */}
              <div style={{ background: "#fff", borderRadius: 8, padding: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--color-primary)", marginBottom: "0.6rem" }}>Recent expenses</div>
                <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "var(--color-text-muted)" }}>
                      <th style={{ textAlign: "left", paddingBottom: "0.3rem", fontWeight: 500 }}>Title</th>
                      <th style={{ textAlign: "left", paddingBottom: "0.3rem", fontWeight: 500 }}>Category</th>
                      <th style={{ textAlign: "right", paddingBottom: "0.3rem", fontWeight: 500 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_EXPENSES.map((e) => (
                      <tr key={e.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "0.3rem 0" }}>{e.title}</td>
                        <td style={{ padding: "0.3rem 0" }}>
                          <span style={{ background: e.category.color, color: "#fff", borderRadius: 4, padding: "0.1rem 0.4rem", fontSize: "0.68rem" }}>{e.category.name}</span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>${e.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "3rem 1rem 4rem" }}>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>Ready to take control of your finances?</p>
        <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }} onClick={() => navigate("/register")}>Get started for free</button>
      </section>
    </div>
  );
}

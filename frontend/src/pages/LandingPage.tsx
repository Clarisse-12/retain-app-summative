import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

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
      <section style={{ textAlign: "center", padding: "5rem 1rem 3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: "1rem" }}>
          Track expenses.<br />Stay on budget.
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem", maxWidth: 480, margin: "0 auto 2rem" }}>
          Retain helps you log expenses, set budgets, and understand your spending — all in one place.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }} onClick={() => navigate("/register")}>
            Create free account
          </button>
          <button className="btn btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }} onClick={() => navigate("/login")}>
            Sign in
          </button>
        </div>
      </section>

      {/* Feature highlights */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem 4rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
        {[
          { icon: "💸", title: "Expense tracking", desc: "Log every expense with category, payment method, and notes. Filter and sort to find anything instantly." },
          { icon: "📊", title: "Budget management", desc: "Set monthly budgets per category. See how much you've spent and how much remains at a glance." },
          { icon: "📈", title: "Spending insights", desc: "Your dashboard shows total spending, highest expense, and a breakdown by category for any month." },
        ].map((f) => (
          <div key={f.title} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
            <div style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.5rem" }}>{f.title}</div>
            <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>{f.desc}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "2rem 1rem 4rem" }}>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>Ready to take control of your finances?</p>
        <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }} onClick={() => navigate("/register")}>
          Get started for free
        </button>
      </section>
    </div>
  );
}

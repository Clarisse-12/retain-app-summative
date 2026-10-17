import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing-header">
        <span className="landing-logo">Retain</span>
        <div className="landing-header-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/login")}>Sign in</button>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>Get started</button>
        </div>
      </header>

      <section className="landing-hero">
        <h1>Track expenses.<br />Stay on budget.</h1>
        <p>Retain helps you log expenses, set budgets, and understand your spending — all in one place.</p>
        <div className="landing-hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
            Create free account
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </div>
      </section>

      <section className="landing-features">
        {[
          { icon: "💸", title: "Expense tracking", desc: "Log every expense with category, payment method, and notes. Filter and sort to find anything instantly." },
          { icon: "📊", title: "Budget management", desc: "Set monthly budgets per category. See how much you've spent and how much remains at a glance." },
          { icon: "📈", title: "Spending insights", desc: "Your dashboard shows total spending, highest expense, and a breakdown by category for any month." },
        ].map((f) => (
          <div key={f.title} className="card feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </section>

      <section className="landing-cta">
        <p>Ready to take control of your finances?</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
          Get started for free
        </button>
      </section>
    </div>
  );
}

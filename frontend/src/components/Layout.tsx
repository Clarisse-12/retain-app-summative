import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = isAdmin
    ? [
        { to: "/admin",            label: "Admin Dashboard" },
        { to: "/admin/categories", label: "Categories" },
      ]
    : [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/expenses",  label: "Expenses" },
        { to: "/budgets",   label: "Budgets" },
      ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{
        width: 220,
        background: "var(--color-primary)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 1rem",
        gap: "0.25rem",
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.5rem", paddingLeft: "0.5rem" }}>
          Retain
        </div>

        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              padding: "0.6rem 0.75rem",
              borderRadius: 6,
              color: "#fff",
              textDecoration: "none",
              background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {label}
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "1rem" }}>
          <div style={{ fontSize: "0.8rem", opacity: 0.7, paddingLeft: "0.5rem", marginBottom: "0.5rem" }}>
            {user?.name}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "2rem", background: "var(--color-bg)", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}

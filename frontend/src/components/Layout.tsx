import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Layout.css";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const close = () => setOpen(false);

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
    <div className="layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <span className="mobile-logo">Retain</span>
        <button className="hamburger" onClick={() => setOpen((o) => !o)}>☰</button>
      </div>

      {/* Overlay */}
      <div className={`sidebar-overlay${open ? " open" : ""}`} onClick={close} />

      <nav className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-logo">Retain</div>

        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            onClick={close}
          >
            {label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-username">{user?.name}</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="layout-main">{children}</main>
    </div>
  );
}

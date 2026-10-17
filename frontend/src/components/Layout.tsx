import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Layout.css";

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
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-logo">Retain</div>

        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
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

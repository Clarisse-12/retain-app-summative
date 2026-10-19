import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import BudgetsPage from "./pages/BudgetsPage";
import AdminPage from "./pages/AdminPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function RequireUser() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  // Admins don't use the normal user pages — redirect them to admin dashboard
  return isAdmin ? <Navigate to="/admin" replace /> : <Outlet />;
}

function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<GuestOnly />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          {/* Normal user routes — admins are redirected away */}
          <Route element={<RequireUser />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/expenses"  element={<ExpensesPage />} />
            <Route path="/budgets"   element={<BudgetsPage />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin"             element={<AdminPage />} />
            <Route path="/admin/categories"  element={<AdminCategoriesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

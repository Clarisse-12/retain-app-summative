const { Router } = require("express");
const {
  getDashboard,
  getUsers,
  getExpenseInsights,
} = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

// All admin routes require authentication AND the ADMIN role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/dashboard
router.get("/dashboard", asyncHandler(getDashboard));

// GET /api/admin/users
router.get("/users", asyncHandler(getUsers));

// GET /api/admin/insights/expenses
router.get("/insights/expenses", asyncHandler(getExpenseInsights));

module.exports = router;

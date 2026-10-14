const { Router } = require("express");
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} = require("../controllers/budget.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { budgetSchema, updateBudgetSchema } = require("../validators/budget.validator");

const router = Router();

// All budget routes require authentication
router.use(authMiddleware);

// GET /api/budgets/summary — must be before /:id to avoid "summary" being treated as an id
router.get("/summary", asyncHandler(getBudgetSummary));

// GET /api/budgets
router.get("/", asyncHandler(getBudgets));

// POST /api/budgets
router.post("/", validate(budgetSchema), asyncHandler(createBudget));

// PATCH /api/budgets/:id
router.patch("/:id", validate(updateBudgetSchema), asyncHandler(updateBudget));

// DELETE /api/budgets/:id
router.delete("/:id", asyncHandler(deleteBudget));

module.exports = router;

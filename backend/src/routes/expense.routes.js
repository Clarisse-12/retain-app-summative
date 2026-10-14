const { Router } = require("express");
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expense.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { expenseSchema, updateExpenseSchema } = require("../validators/expense.validator");

const router = Router();

// All expense routes require authentication
router.use(authMiddleware);

// GET /api/expenses
router.get("/", asyncHandler(getExpenses));

// GET /api/expenses/:id
router.get("/:id", asyncHandler(getExpense));

// POST /api/expenses
router.post("/", validate(expenseSchema), asyncHandler(createExpense));

// PATCH /api/expenses/:id
router.patch("/:id", validate(updateExpenseSchema), asyncHandler(updateExpense));

// DELETE /api/expenses/:id
router.delete("/:id", asyncHandler(deleteExpense));

module.exports = router;

const prisma = require("../config/database");

/**
 * GET /api/budgets
 * Returns all budgets belonging to the authenticated user.
 * Optional query params: month, year
 */
const getBudgets = async (req, res) => {
  const userId = req.user.id;
  const { month, year } = req.query;

  const where = { userId };

  if (month) where.month = parseInt(month, 10);
  if (year) where.year = parseInt(year, 10);

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  res.json({ budgets });
};

/**
 * POST /api/budgets
 * Creates a new budget for the authenticated user.
 * Prevents duplicate budgets for the same user, month, year, and category.
 */
const createBudget = async (req, res) => {
  const { amount, month, year, categoryId } = req.body;
  const userId = req.user.id;

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  const duplicate = await prisma.budget.findFirst({
    where: {
      userId,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      categoryId: categoryId ? categoryId : null,
    },
  });

  if (duplicate) {
    const label = categoryId ? "category budget" : "overall budget";
    return res.status(409).json({ message: `A ${label} for that month already exists` });
  }

  const budget = await prisma.budget.create({
    data: {
      amount,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      userId,
      categoryId: categoryId ?? null,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  res.status(201).json({ budget });
};

/**
 * PATCH /api/budgets/:id
 * Updates a budget. Only the owner can update it.
 */
const updateBudget = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { amount, month, year, categoryId } = req.body;

  const budget = await prisma.budget.findUnique({ where: { id } });

  if (!budget || budget.userId !== userId) {
    return res.status(404).json({ message: "Budget not found" });
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || category.userId !== userId) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  const updated = await prisma.budget.update({
    where: { id },
    data: {
      ...(amount !== undefined && { amount }),
      ...(month !== undefined && { month }),
      ...(year !== undefined && { year }),
      ...("categoryId" in req.body && { categoryId: categoryId ?? null }),
    },
    include: { category: { select: { id: true, name: true } } },
  });

  res.json({ budget: updated });
};

/**
 * DELETE /api/budgets/:id
 * Deletes a budget. Only the owner can delete it.
 */
const deleteBudget = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const budget = await prisma.budget.findUnique({ where: { id } });

  if (!budget || budget.userId !== userId) {
    return res.status(404).json({ message: "Budget not found" });
  }

  await prisma.budget.delete({ where: { id } });

  res.json({ message: "Budget deleted successfully" });
};

/**
 * GET /api/budgets/summary
 * Returns budgets for a given month and year with actual spending calculated.
 * Required query params: month, year
 */
const getBudgetSummary = async (req, res) => {
  const userId = req.user.id;
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "month and year query parameters are required" });
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (isNaN(monthNum) || isNaN(yearNum)) {
    return res.status(400).json({ message: "month and year must be valid numbers" });
  }

  // Start and end of the requested month
  const dateFrom = new Date(yearNum, monthNum - 1, 1);
  const dateTo = new Date(yearNum, monthNum, 1);

  const [budgets, expenses] = await prisma.$transaction([
    prisma.budget.findMany({
      where: { userId, month: monthNum, year: yearNum },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.expense.findMany({
      where: {
        userId,
        date: { gte: dateFrom, lt: dateTo },
      },
      select: { amount: true, categoryId: true },
    }),
  ]);

  // Calculate total spending per category and overall
  const spendingByCategory = {};
  let totalSpent = 0;

  for (const expense of expenses) {
    const amount = parseFloat(expense.amount);
    totalSpent += amount;
    const key = expense.categoryId ?? "overall";
    spendingByCategory[key] = (spendingByCategory[key] || 0) + amount;
  }

  const summary = budgets.map((budget) => {
    const key = budget.categoryId ?? "overall";
    const spent = spendingByCategory[key] || 0;
    const budgetAmount = parseFloat(budget.amount);

    return {
      ...budget,
      spent,
      remaining: budgetAmount - spent,
      percentUsed: budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0,
    };
  });

  res.json({
    summary,
    month: monthNum,
    year: yearNum,
    totalSpent,
  });
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary };

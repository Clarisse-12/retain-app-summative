const prisma = require("../config/database");

/**
 * GET /api/admin/dashboard
 * Returns platform-wide stats: total users, total expenses, total value, recent expenses.
 */
const getDashboard = async (req, res) => {
  const [userCount, expenseCount, expenseAggregate, recentExpenses] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.expense.count(),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.expense.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, color: true } },
        },
      }),
    ]);

  res.json({
    stats: {
      totalUsers: userCount,
      totalExpenses: expenseCount,
      totalExpenseValue: parseFloat(expenseAggregate._sum.amount ?? 0),
    },
    recentExpenses,
  });
};

/**
 * GET /api/admin/users
 * Returns all users with their expense and budget counts. Never returns passwords.
 */
const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          expenses: true,
          budgets: true,
          categories: true,
        },
      },
    },
  });

  res.json({ users });
};

/**
 * GET /api/admin/insights/expenses
 * Returns spending totals grouped by category and monthly spending totals across all users.
 */
const getExpenseInsights = async (req, res) => {
  const [byCategory, byMonth] = await prisma.$transaction([
    // Spending grouped by category
    prisma.expense.groupBy({
      by: ["categoryId"],
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    }),

    // Monthly spending totals
    prisma.expense.groupBy({
      by: ["date"],
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Fetch category names for the grouped results
  const categoryIds = byCategory
    .map((g) => g.categoryId)
    .filter(Boolean);

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const spendingByCategory = byCategory.map((g) => ({
    category: g.categoryId ? categoryMap[g.categoryId] ?? null : null,
    totalAmount: parseFloat(g._sum.amount ?? 0),
    expenseCount: g._count.id,
  }));

  // Roll up daily dates into year-month buckets
  const monthlyMap = {};
  for (const row of byMonth) {
    const d = new Date(row.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = { month: key, totalAmount: 0, expenseCount: 0 };
    }
    monthlyMap[key].totalAmount += parseFloat(row._sum.amount ?? 0);
    monthlyMap[key].expenseCount += row._count.id;
  }

  const spendingByMonth = Object.values(monthlyMap).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  res.json({ spendingByCategory, spendingByMonth });
};

module.exports = { getDashboard, getUsers, getExpenseInsights };

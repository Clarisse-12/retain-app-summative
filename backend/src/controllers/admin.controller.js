const prisma = require("../config/database");

/**
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
  const now = new Date();
  const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
  const year  = req.query.year  ? parseInt(req.query.year,  10) : now.getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd   = new Date(year, month,     1);

  const [userCount, expenseCount, expenseAggregate, expensesThisMonth, recentExpenses, recentUsers] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.expense.count(),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.expense.count({ where: { date: { gte: monthStart, lt: monthEnd } } }),
      prisma.expense.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

  res.json({
    stats: {
      totalUsers: userCount,
      totalExpenses: expenseCount,
      totalExpenseValue: parseFloat(expenseAggregate._sum.amount ?? 0),
      expensesThisMonth,
    },
    recentExpenses,
    recentUsers,
  });
};

/**
 * GET /api/admin/users
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
      _count: { select: { expenses: true, budgets: true, categories: true } },
    },
  });

  res.json({ users });
};

/**
 * GET /api/admin/insights/expenses
 */
const getExpenseInsights = async (req, res) => {
  const [byCategory, byMonth] = await prisma.$transaction([
    prisma.expense.groupBy({
      by: ["categoryId"],
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.expense.groupBy({
      by: ["date"],
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const categoryIds = byCategory.map((g) => g.categoryId).filter(Boolean);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const spendingByCategory = byCategory.map((g) => ({
    category: g.categoryId ? categoryMap[g.categoryId] ?? null : null,
    totalAmount: parseFloat(g._sum.amount ?? 0),
    expenseCount: g._count.id,
  }));

  // Top 5 most-used (already sorted desc by count)
  const top5 = spendingByCategory.slice(0, 5);
  // Bottom 5 least-used
  const bottom5 = [...spendingByCategory].sort((a, b) => a.expenseCount - b.expenseCount).slice(0, 5);

  // Roll up into year-month buckets
  const monthlyMap = {};
  for (const row of byMonth) {
    const d = new Date(row.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, totalAmount: 0, expenseCount: 0 };
    monthlyMap[key].totalAmount += parseFloat(row._sum.amount ?? 0);
    monthlyMap[key].expenseCount += row._count.id;
  }
  const spendingByMonth = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  res.json({ spendingByCategory, top5, bottom5, spendingByMonth });
};

module.exports = { getDashboard, getUsers, getExpenseInsights };

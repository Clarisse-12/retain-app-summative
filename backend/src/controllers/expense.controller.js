const prisma = require("../config/database");

const ALLOWED_SORT_FIELDS = ["date", "amount", "title"];
const ALLOWED_SORT_ORDERS = ["asc", "desc"];
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * GET /api/expenses
 * Returns the authenticated user's expenses with optional filtering, sorting, and pagination.
 * Query params: categoryId, dateFrom, dateTo, search, sortBy, order, page, limit
 */
const getExpenses = async (req, res) => {
  const userId = req.user.id;
  const {
    categoryId,
    dateFrom,
    dateTo,
    search,
    paymentMethod,
    sortBy = "date",
    order = "desc",
    page = "1",
    limit = String(DEFAULT_PAGE_SIZE),
  } = req.query;

  const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "date";
  const sortOrder = ALLOWED_SORT_ORDERS.includes(order) ? order : "desc";

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit, 10) || DEFAULT_PAGE_SIZE));
  const skip = (pageNum - 1) * pageSize;

  const where = { userId };

  if (categoryId) where.categoryId = categoryId;

  if (paymentMethod) where.paymentMethod = paymentMethod;

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [expenses, total] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { [sortField]: sortOrder },
      skip,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  res.json({
    expenses,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

/**
 * GET /api/expenses/:id
 * Returns a single expense belonging to the authenticated user.
 */
const getExpense = async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: { id: req.params.id },
    include: { category: { select: { id: true, name: true } } },
  });

  if (!expense || expense.userId !== req.user.id) {
    return res.status(404).json({ message: "Expense not found" });
  }

  res.json({ expense });
};

/**
 * POST /api/expenses
 * Creates a new expense for the authenticated user.
 */
const createExpense = async (req, res) => {
  const { title, description, amount, date, categoryId, paymentMethod } = req.body;
  const userId = req.user.id;

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || category.userId !== userId) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  const expense = await prisma.expense.create({
    data: {
      title,
      description,
      amount,
      date: date ? new Date(date) : undefined,
      paymentMethod,
      userId,
      categoryId: categoryId ?? null,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  res.status(201).json({ expense });
};

/**
 * PATCH /api/expenses/:id
 * Updates an expense. Only the owner can update it.
 */
const updateExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, amount, date, categoryId, paymentMethod } = req.body;

  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense || expense.userId !== userId) {
    return res.status(404).json({ message: "Expense not found" });
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || category.userId !== userId) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(amount !== undefined && { amount }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...("categoryId" in req.body && { categoryId: categoryId ?? null }),
    },
    include: { category: { select: { id: true, name: true } } },
  });

  res.json({ expense: updated });
};

/**
 * DELETE /api/expenses/:id
 * Deletes an expense. Only the owner can delete it.
 */
const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense || expense.userId !== userId) {
    return res.status(404).json({ message: "Expense not found" });
  }

  await prisma.expense.delete({ where: { id } });

  res.json({ message: "Expense deleted successfully" });
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense };

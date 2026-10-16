const prisma = require("../config/database");

/**
 * GET /api/categories
 * Returns all categories belonging to the authenticated user.
 */
const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  res.json({ categories });
};

/**
 * POST /api/categories
 * Creates a new category for the authenticated user.
 * Prevents case-insensitive duplicate names.
 */
const createCategory = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  const duplicate = await prisma.category.findFirst({
    where: {
      userId,
      name: { equals: name, mode: "insensitive" },
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "You already have a category with that name" });
  }

  const category = await prisma.category.create({
    data: { name, userId },
  });

  res.status(201).json({ category });
};

/**
 * PATCH /api/categories/:id
 * Updates a category. Only the owner can update it.
 */
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return res.status(404).json({ message: "Category not found" });

  if (name && name.toLowerCase() !== category.name.toLowerCase()) {
    const duplicate = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, NOT: { id } },
    });
    if (duplicate) return res.status(409).json({ message: "A category with that name already exists" });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { ...(name !== undefined && { name }) },
  });

  res.json({ category: updated });
};

/**
 * DELETE /api/categories/:id
 * Deletes a category. Expenses and budgets linked to it have their
 * categoryId set to null automatically via the onDelete: SetNull rule in the schema.
 */
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return res.status(404).json({ message: "Category not found" });

  await prisma.category.delete({ where: { id } });

  res.json({ message: "Category deleted successfully" });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

const { Router } = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { categorySchema, updateCategorySchema } = require("../validators/category.validator");

const router = Router();

// All category routes require authentication
router.use(authMiddleware);

// GET /api/categories
router.get("/", asyncHandler(getCategories));

// POST /api/categories
router.post("/", validate(categorySchema), asyncHandler(createCategory));

// PATCH /api/categories/:id
router.patch("/:id", validate(updateCategorySchema), asyncHandler(updateCategory));

// DELETE /api/categories/:id
router.delete("/:id", asyncHandler(deleteCategory));

module.exports = router;

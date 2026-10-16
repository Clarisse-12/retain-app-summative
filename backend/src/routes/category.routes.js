const { Router } = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { categorySchema, updateCategorySchema } = require("../validators/category.validator");

const router = Router();

// All category routes require authentication
router.use(authMiddleware);

// GET /api/categories — any authenticated user (needed for expense/budget forms)
router.get("/", asyncHandler(getCategories));

// Write operations — admin only
router.post("/", adminMiddleware, validate(categorySchema), asyncHandler(createCategory));
router.patch("/:id", adminMiddleware, validate(updateCategorySchema), asyncHandler(updateCategory));
router.delete("/:id", adminMiddleware, asyncHandler(deleteCategory));

module.exports = router;

const { z } = require("zod");

const categorySchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color must be a valid hex code e.g. #fff or #ff5733")
    .optional()
    .default("#6366f1"),
});

const updateCategorySchema = categorySchema.partial();

module.exports = { categorySchema, updateCategorySchema };

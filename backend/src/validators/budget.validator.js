const { z } = require("zod");

const budgetSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .finite("Amount must be a finite number"),
  month: z
    .number({ required_error: "Month is required", invalid_type_error: "Month must be a number" })
    .int("Month must be a whole number")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z
    .number({ required_error: "Year is required", invalid_type_error: "Year must be a number" })
    .int("Year must be a whole number")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
  categoryId: z
    .string()
    .cuid("Invalid category ID")
    .nullable()
    .optional(),
});

const updateBudgetSchema = budgetSchema.partial();

module.exports = { budgetSchema, updateBudgetSchema };

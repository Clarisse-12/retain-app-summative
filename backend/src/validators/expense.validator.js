const { z } = require("zod");

const expenseSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .finite("Amount must be a finite number"),
  date: z
    .string()
    .datetime({ offset: true, message: "Date must be a valid ISO 8601 datetime string" })
    .refine((d) => new Date(d) <= new Date(), { message: "Expense date cannot be in the future" })
    .optional(),
  categoryId: z
    .string()
    .cuid("Invalid category ID")
    .nullable()
    .optional(),
  paymentMethod: z
    .enum(["CASH", "CARD", "BANK_TRANSFER", "MOBILE_PAYMENT", "OTHER"], {
      errorMap: () => ({ message: "Invalid payment method" }),
    })
    .optional(),
});

const updateExpenseSchema = expenseSchema.partial();

module.exports = { expenseSchema, updateExpenseSchema };

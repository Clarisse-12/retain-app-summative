/**
 * Validation middleware factory.
 * Takes a Zod schema and returns an Express middleware that validates req.body.
 * On failure, responds with 400 and a list of field-level error messages.
 * On success, replaces req.body with the parsed (cleaned) data and calls next().
 *
 * Usage: router.post("/register", validate(registerSchema), asyncHandler(controller))
 *
 * @param {import("zod").ZodTypeAny} schema - A Zod schema to validate against
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.body = result.data;
  next();
};

module.exports = validate;

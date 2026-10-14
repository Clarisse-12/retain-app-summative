const isProd = process.env.NODE_ENV === "production";

/**
 * Centralized Express error-handling middleware.
 * Must be registered LAST in app.js, after all routes.
 * Signature must have exactly 4 parameters for Express to treat it as an error handler.
 */
const errorMiddleware = (err, req, res, next) => {
  // Prevent sending a second response if headers were already sent
  if (res.headersSent) return next(err);

  // Prisma: record not found
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  // Prisma: unique constraint violation
  if (err.code === "P2002") {
    return res.status(409).json({ message: "A record with that value already exists" });
  }

  // Errors created with a specific status (e.g. 401, 403, 404)
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    message,
    // Only include the stack trace in development so secrets are never leaked in production
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = errorMiddleware;

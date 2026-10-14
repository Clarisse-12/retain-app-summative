/**
 * Wraps an async Express route handler and forwards any error to next().
 * Usage: router.get("/path", asyncHandler(async (req, res) => { ... }))
 *
 * @param {Function} fn - An async Express handler (req, res, next)
 * @returns {Function} A standard Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

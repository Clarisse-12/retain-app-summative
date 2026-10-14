/**
 * Admin authorization middleware.
 * Must be used AFTER authMiddleware so that req.user is already set.
 * Blocks access with 403 if the authenticated user does not have the ADMIN role.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = adminMiddleware;

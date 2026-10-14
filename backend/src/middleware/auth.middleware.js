const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

/**
 * Authentication middleware.
 * Reads the Bearer token from the Authorization header, verifies it,
 * loads the user from the database, and sets req.user.
 * Returns 401 if the token is missing, invalid, expired, or the user no longer exists.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "User no longer exists" });
  }

  req.user = user;
  next();
};

module.exports = authMiddleware;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

const DEFAULT_CATEGORIES = [
  { name: "Food" },
  { name: "Transport"},
  { name: "Housing" },
  { name: "Health" },
  { name: "Education" },
  { name: "Entertainment" },
  { name: "Other" },
];

/**
 * Builds a safe user object — never includes the password.
 */
const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

/**
 * Signs a JWT for the given user id.
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER",
      categories: {
        create: DEFAULT_CATEGORIES,
      },
    },
  });

  const token = signToken(user.id);

  res.status(201).json({ token, user: safeUser(user) });
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user.id);

  res.json({ token, user: safeUser(user) });
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };

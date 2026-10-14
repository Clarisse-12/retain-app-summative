const { Router } = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const router = Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), asyncHandler(register));

// POST /api/auth/login
router.post("/login", validate(loginSchema), asyncHandler(login));

// GET /api/auth/me
router.get("/me", authMiddleware, asyncHandler(getMe));

module.exports = router;

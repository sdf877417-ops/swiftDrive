import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import { User } from "../models/User.js";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." },
});
const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
});
function publicUser(user: { _id: unknown; name: string; email: string }) {
  return { id: String(user._id), name: user.name, email: user.email };
}
router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      return;
    }
    const { name, email, password } = parsed.data;
    const normalized = email.toLowerCase();
    if (await User.exists({ email: normalized })) {
      res
        .status(409)
        .json({ message: "An account with this email already exists." });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalized, passwordHash });
    const access = createAccessToken(String(user._id));
    const refresh = createRefreshToken(String(user._id));
    user.refreshTokenHash = hashToken(refresh);
    await user.save();
    setAuthCookies(res, access, refresh);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

// const response = await api.post("/auth/login",

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Enter a valid email and password." });
      return;
    }
    const user = await User.findOne({
      email: parsed.data.email.toLowerCase(),
    }).select("+passwordHash +refreshTokenHash");
    if (
      !user ||
      !(await bcrypt.compare(parsed.data.password, user.passwordHash))
    ) {
      res.status(401).json({ message: "Incorrect email or password." });
      return;
    }
    const access = createAccessToken(String(user._id));
    const refresh = createRefreshToken(String(user._id));
    user.refreshTokenHash = hashToken(refresh);
    await user.save();
    setAuthCookies(res, access, refresh);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) {
    clearAuthCookies(res);
    res.status(401).json({ message: "No refresh session" });
    return;
  }
  try {
    const userId = verifyRefreshToken(token);
    const user = await User.findById(userId).select("+refreshTokenHash");
    if (
      !user ||
      !user.refreshTokenHash ||
      user.refreshTokenHash !== hashToken(token)
    ) {
      clearAuthCookies(res);
      res.status(401).json({ message: "Session is no longer valid" });
      return;
    }
    const nextRefresh = createRefreshToken(userId);
    const access = createAccessToken(userId);
    user.refreshTokenHash = hashToken(nextRefresh);
    await user.save();
    setAuthCookies(res, access, nextRefresh);
    res.json({ message: "Session refreshed" });
  } catch {
    clearAuthCookies(res);
    res.status(401).json({ message: "Session expired" });
  }
});
router.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (token) {
      try {
        const id = verifyRefreshToken(token);
        await User.findByIdAndUpdate(id, { $set: { refreshTokenHash: null } });
      } catch {
        /* Expired or invalid token: clear local cookies anyway. */
      }
    }
    clearAuthCookies(res);
    res.json({ message: "Signed out" });
  } catch (error) {
    next(error);
  }
});
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("name email");
    if (!user) {
      res.status(401).json({ message: "Account not found" });
      return;
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
export default router;

import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "dev_secret";
const sign = (id) => jwt.sign({ id }, SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: "Email already in use" });
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: sign(user._id), user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token: sign(user._id), user });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.patch("/me", requireAuth, async (req, res) => {
  const { name, address } = req.body;
  const user = await User.findByIdAndUpdate(req.userId, { name, address }, { new: true });
  res.json(user);
});

export default router;

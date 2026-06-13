import express from "express";
import Member from "../models/Member.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const members = await Member.find().sort({ createdAt: -1 });
  res.json(members);
});

router.post("/", async (req, res) => {
  const { name, email, role, avatarUrl } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email required" });
  const member = await Member.create({ name, email, role, avatarUrl });
  res.status(201).json(member);
});

export default router;

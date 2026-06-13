import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

router.post("/", async (req, res) => {
  const { name, description, status, color, dueDate } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const project = await Project.create({ name, description, status, color, dueDate });
  res.status(201).json(project);
});

router.get("/:id", async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

router.patch("/:id", async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

router.delete("/:id", async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export default router;

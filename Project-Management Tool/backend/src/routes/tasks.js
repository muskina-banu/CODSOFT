import express from "express";
import Task from "../models/Task.js";
import Member from "../models/Member.js";
import Project from "../models/Project.js";

const router = express.Router();

async function enrichTask(task) {
  const obj = task.toJSON();
  if (obj.assigneeId) {
    const m = await Member.findById(obj.assigneeId);
    obj.assigneeName = m?.name || null;
    obj.assigneeAvatar = m?.avatarUrl || null;
  } else {
    obj.assigneeName = null;
    obj.assigneeAvatar = null;
  }
  const p = await Project.findById(obj.projectId);
  obj.projectName = p?.name || null;
  return obj;
}

// All tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  const enriched = await Promise.all(tasks.map(enrichTask));
  res.json(enriched);
});

// Tasks for a project
router.get("/by-project/:projectId", async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.projectId }).sort({ createdAt: 1 });
  const enriched = await Promise.all(tasks.map(enrichTask));
  res.json(enriched);
});

router.post("/", async (req, res) => {
  const { title, description, status, priority, projectId, assigneeId, dueDate } = req.body;
  if (!title || !projectId) return res.status(400).json({ error: "Title and projectId required" });
  const task = await Task.create({ title, description, status, priority, projectId, assigneeId: assigneeId || null, dueDate });
  res.status(201).json(await enrichTask(task));
});

router.get("/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(await enrichTask(task));
});

router.patch("/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(await enrichTask(task));
});

router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export default router;

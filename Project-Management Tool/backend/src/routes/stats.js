import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Member from "../models/Member.js";

const router = express.Router();

router.get("/overview", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const [projects, tasks] = await Promise.all([Project.find(), Task.find()]);
  res.json({
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === "active").length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === "done").length,
    overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done").length,
    upcomingDeadlines: tasks.filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= in7 && t.status !== "done").length,
  });
});

router.get("/projects/:id/progress", async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.id });
  const count = (s) => tasks.filter(t => t.status === s).length;
  res.json({
    projectId: req.params.id,
    todo: count("todo"),
    inProgress: count("in_progress"),
    inReview: count("in_review"),
    done: count("done"),
    total: tasks.length,
  });
});

router.get("/upcoming-deadlines", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const in14 = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  const tasks = await Task.find();
  const upcoming = tasks
    .filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= in14 && t.status !== "done")
    .sort((a, b) => a.dueDate > b.dueDate ? 1 : -1);
  const enriched = await Promise.all(upcoming.map(async task => {
    const obj = task.toJSON();
    const [member, project] = await Promise.all([
      task.assigneeId ? Member.findById(task.assigneeId) : null,
      Project.findById(task.projectId),
    ]);
    obj.assigneeName = member?.name || null;
    obj.assigneeAvatar = member?.avatarUrl || null;
    obj.projectName = project?.name || null;
    return obj;
  }));
  res.json(enriched);
});

export default router;

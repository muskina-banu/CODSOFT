import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import projectsRouter from "./routes/projects.js";
import tasksRouter from "./routes/tasks.js";
import membersRouter from "./routes/members.js";
import statsRouter from "./routes/stats.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/members", membersRouter);
app.use("/api/stats", statsRouter);

app.get("/api/healthz", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/flowboard";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

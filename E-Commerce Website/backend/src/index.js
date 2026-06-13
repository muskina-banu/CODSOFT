import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import { seedProducts } from "./seed.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.get("/api/healthz", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/shopease";

mongoose.connect(MONGO_URI).then(async () => {
  console.log("Connected to MongoDB");
  await seedProducts();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => { console.error("MongoDB error:", err.message); process.exit(1); });

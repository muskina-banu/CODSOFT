import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;
  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  let query = Product.find(filter);
  if (sort === "price_asc") query = query.sort({ price: 1 });
  else if (sort === "price_desc") query = query.sort({ price: -1 });
  else if (sort === "rating") query = query.sort({ rating: -1 });
  else query = query.sort({ createdAt: -1 });
  const products = await query;
  res.json(products);
});

router.get("/categories", async (_, res) => {
  const categories = await Product.distinct("category");
  res.json(categories);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

export default router;

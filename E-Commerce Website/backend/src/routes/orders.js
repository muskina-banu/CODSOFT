import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "No items in order" });
  // Enrich items with current product data
  const enriched = await Promise.all(items.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    return { productId: product._id, name: product.name, price: product.price, image: product.image, quantity: item.quantity };
  }));
  const total = enriched.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = await Order.create({
    userId: req.userId, items: enriched, total,
    shippingAddress, paymentMethod: paymentMethod || "card",
    paymentStatus: "paid", status: "processing",
  });
  res.status(201).json(order);
});

router.get("/", requireAuth, async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get("/:id", requireAuth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

export default router;

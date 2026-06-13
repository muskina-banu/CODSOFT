import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String, price: Number, image: String, quantity: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  shippingAddress: { street: String, city: String, state: String, zip: String, country: String },
  paymentMethod: { type: String, default: "card" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
}, { timestamps: true });

orderSchema.set("toJSON", {
  virtuals: true,
  transform: (_, obj) => { obj.id = obj._id; delete obj._id; delete obj.__v; return obj; },
});

export default mongoose.model("Order", orderSchema);

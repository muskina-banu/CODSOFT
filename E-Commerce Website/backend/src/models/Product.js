import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.set("toJSON", {
  virtuals: true,
  transform: (_, obj) => { obj.id = obj._id; delete obj._id; delete obj.__v; return obj; },
});

export default mongoose.model("Product", productSchema);

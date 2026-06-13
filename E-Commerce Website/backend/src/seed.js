import Product from "./models/Product.js";

const products = [
  { name: "Wireless Headphones", description: "Premium noise-cancelling headphones with 30hr battery.", price: 79.99, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", stock: 50, rating: 4.5 },
  { name: "Running Shoes", description: "Lightweight performance running shoes for all terrains.", price: 89.99, category: "Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", stock: 30, rating: 4.7 },
  { name: "Backpack", description: "Durable 30L hiking backpack with laptop compartment.", price: 49.99, category: "Bags", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", stock: 25, rating: 4.3 },
  { name: "Smart Watch", description: "Fitness tracker with heart rate monitor and GPS.", price: 129.99, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", stock: 20, rating: 4.6 },
  { name: "Sunglasses", description: "UV400 polarized sunglasses with lightweight frame.", price: 34.99, category: "Accessories", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", stock: 60, rating: 4.2 },
  { name: "Yoga Mat", description: "Non-slip eco-friendly yoga mat, 6mm thick.", price: 29.99, category: "Sports", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400", stock: 40, rating: 4.4 },
  { name: "Coffee Maker", description: "12-cup programmable drip coffee maker.", price: 59.99, category: "Kitchen", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400", stock: 15, rating: 4.5 },
  { name: "Desk Lamp", description: "LED desk lamp with adjustable brightness and USB port.", price: 24.99, category: "Home", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", stock: 35, rating: 4.1 },
  { name: "Water Bottle", description: "32oz insulated stainless steel water bottle.", price: 19.99, category: "Sports", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", stock: 80, rating: 4.8 },
  { name: "Bluetooth Speaker", description: "Portable waterproof speaker with 12hr battery.", price: 44.99, category: "Electronics", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", stock: 22, rating: 4.6 },
  { name: "T-Shirt", description: "100% organic cotton premium t-shirt.", price: 24.99, category: "Clothing", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", stock: 100, rating: 4.3 },
  { name: "Sneakers", description: "Classic canvas sneakers, available in multiple colors.", price: 54.99, category: "Footwear", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400", stock: 45, rating: 4.4 },
];

export async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(products);
    console.log("Seeded", products.length, "products");
  }
}

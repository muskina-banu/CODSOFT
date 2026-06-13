import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Star, ArrowLeft, Package } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    apiFetch(`/products/${id}`).then(setProduct).catch(() => setLocation("/")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-96 bg-white rounded-xl animate-pulse" />;
  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} /> Back to products
      </button>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-square bg-gray-100">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.src = "https://via.placeholder.com/600x600?text=No+Image"; }} />
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              <span className="text-sm text-purple-600 font-medium">{product.category}</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                ))}
                <span className="text-sm text-gray-500">({product.rating})</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                <Package size={16} />
                <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-4">${product.price.toFixed(2)}</p>
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm font-medium text-gray-700">Qty:</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-medium">−</button>
                  <span className="px-4 py-2 text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-medium">+</button>
                </div>
              </div>
              <button
                disabled={product.stock === 0}
                onClick={() => { addItem(product, qty); toast({ title: "Added to cart", description: `${qty}x ${product.name}` }); }}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

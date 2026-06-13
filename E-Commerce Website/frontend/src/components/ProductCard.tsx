import { Link } from "wouter";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/products/${product.id}`}>
        <a className="block">
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => { e.currentTarget.src = "https://via.placeholder.com/400x400?text=No+Image"; }}
            />
          </div>
          <div className="p-4">
            <p className="text-xs text-purple-600 font-medium mb-1">{product.category}</p>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">{product.rating}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
          </div>
        </a>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={() => addItem(product)}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <ShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </div>
  );
}

import { useCart } from "@/context/CartContext";
import { useLocation } from "wouter";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <button onClick={() => setLocation("/")} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({items.length})</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Clear All</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100"
              onError={e => { e.currentTarget.src = "https://via.placeholder.com/64x64?text=?"; }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
              <p className="text-purple-600 font-bold mt-0.5">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-gray-100 text-sm font-medium">−</button>
              <span className="px-3 py-1.5 text-sm font-semibold">{item.quantity}</span>
              <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-100 text-sm font-medium">+</button>
            </div>
            <p className="text-sm font-bold w-16 text-right">${(item.price * item.quantity).toFixed(2)}</p>
            <button onClick={() => removeItem(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Subtotal</span><span>${total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Shipping</span><span className="text-green-600">Free</span>
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3 flex items-center justify-between font-bold text-lg">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
        <button onClick={() => setLocation("/checkout")} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold mt-4 transition-colors">
          Proceed to Checkout <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

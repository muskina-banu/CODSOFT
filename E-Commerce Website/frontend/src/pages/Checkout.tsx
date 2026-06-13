import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Lock, CheckCircle } from "lucide-react";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({
    street: "", city: "", state: "", zip: "", country: "",
    cardName: "", cardNumber: "", expiry: "", cvv: "",
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-xl font-bold mb-4">Please log in to checkout</h2>
        <button onClick={() => setLocation("/login")} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700">
          Login
        </button>
      </div>
    );
  }

  if (items.length === 0 && !done) {
    setLocation("/cart");
    return null;
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <CheckCircle size={60} className="mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-2">Your order <strong>#{orderId.slice(-8).toUpperCase()}</strong> has been confirmed.</p>
        <p className="text-gray-400 text-sm mb-8">Payment processed successfully. We'll ship it soon!</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setLocation("/orders")} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700">
            View Orders
          </button>
          <button onClick={() => setLocation("/")} className="border border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.street || !form.city || !form.country) { toast({ title: "Please fill in shipping address", variant: "destructive" }); return; }
    if (!form.cardNumber || !form.expiry || !form.cvv) { toast({ title: "Please fill in payment details", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const order = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
          shippingAddress: { street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country },
          paymentMethod: "card",
        }),
      });
      clearCart();
      setOrderId(order.id);
      setDone(true);
    } catch (err) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
      <input value={form[key]} onChange={e => set(key, e.target.value)} type={type} placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-3">
                {field("Street Address", "street", "text", "123 Main St")}
                <div className="grid grid-cols-2 gap-3">
                  {field("City", "city", "text", "New York")}
                  {field("State", "state", "text", "NY")}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {field("ZIP Code", "zip", "text", "10001")}
                  {field("Country", "country", "text", "USA")}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-purple-600" />
                <h2 className="font-semibold text-gray-900">Payment Details</h2>
                <div className="flex items-center gap-1 ml-auto text-xs text-green-600">
                  <Lock size={12} /> Secure
                </div>
              </div>
              <div className="space-y-3">
                {field("Cardholder Name", "cardName", "text", "John Doe")}
                {field("Card Number", "cardNumber", "text", "1234 5678 9012 3456")}
                <div className="grid grid-cols-2 gap-3">
                  {field("Expiry (MM/YY)", "expiry", "text", "12/26")}
                  {field("CVV", "cvv", "text", "123")}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">* This is a demo — no real payment is processed.</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map(i => (
                  <div key={i.id} className="flex items-center gap-2 text-sm">
                    <img src={i.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={e => { e.currentTarget.src="https://via.placeholder.com/40x40?text=?";}} />
                    <span className="flex-1 text-gray-700 truncate">{i.name} ×{i.quantity}</span>
                    <span className="font-medium">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between font-bold">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold mt-4 transition-colors">
                {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

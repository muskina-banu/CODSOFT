import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Package, ChevronRight } from "lucide-react";

const statusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    apiFetch("/orders").then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
        <button onClick={() => setLocation("/")} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      {orders.map(order => (
        <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {order.items.slice(0, 4).map((item, i) => (
              <img key={i} src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                onError={e => { e.currentTarget.src = "https://via.placeholder.com/40x40?text=?"; }} />
            ))}
            {order.items.length > 4 && <span className="text-xs text-gray-400">+{order.items.length - 4} more</span>}
            <span className="text-xs text-gray-400 ml-1">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

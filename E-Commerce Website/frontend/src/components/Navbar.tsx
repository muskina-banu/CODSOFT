import { Link, useLocation } from "wouter";
import { ShoppingCart, User, LogOut, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [, setLocation] = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-xl font-bold text-purple-600">ShopEase</a>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <a className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </a>
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/orders">
                <a className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">
                  <Package size={16} /> Orders
                </a>
              </Link>
              <span className="text-sm text-gray-600 font-medium">{user.name}</span>
              <button onClick={() => { logout(); setLocation("/"); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <a className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">Login</a>
              </Link>
              <Link href="/register">
                <a className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium">Sign Up</a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

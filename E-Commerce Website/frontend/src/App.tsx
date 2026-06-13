import { Switch, Route, Redirect } from "wouter";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Orders from "@/pages/Orders";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-6">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/products/:id" component={ProductDetail} />
              <Route path="/cart" component={Cart} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/orders" component={Orders} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route>
                <div className="text-center py-20"><h1 className="text-2xl font-bold">Page Not Found</h1></div>
              </Route>
            </Switch>
          </main>
        </div>
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}

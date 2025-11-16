import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import NotificationsPage from "./pages/NotificationsPage";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useUserProfile } from "./hooks/useUserProfile";
import { useAuth } from "./context/AuthContext";

import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";

import OrderIssueFormPage from "./pages/OrderIssueFormPage";
import RefundFormPage from "./pages/RefundFormPage";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { profile, profileLoading } = useUserProfile();

  if (loading || profileLoading) {
    return (
      <main className="min-h-screen bg-choSand flex items-center justify-center">
        <p className="text-sm text-gray-600">Checking permissions...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: "/admin/products" }} replace />;
  }

  if (profile?.role !== "admin") {
    return (
      <main className="min-h-screen bg-choSand flex items-center justify-center">
        <p className="text-sm text-gray-600">
          You don&apos;t have permission to view this page.
        </p>
      </main>
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-choSand text-choForest flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />

                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProductsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrdersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <AdminRoute>
                      <AdminNotificationsPage />
                    </AdminRoute>
                  }
                />

                <Route
                  path="/orders/:orderId/issue"
                  element={<OrderIssueFormPage />}
                />
                <Route
                  path="/orders/:orderId/refund"
                  element={<RefundFormPage />}
                />

                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

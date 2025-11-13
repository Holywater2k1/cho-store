import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState("confirming");

  useEffect(() => {
    const confirm = async () => {
      if (!sessionId || !items.length) return;
      const userInfo = {
        id: user?.id,
        email: user?.email ?? "guest@example.com",
        fullName: "Guest",
        address_line1: "Test address",
        city: "Bangkok",
        province: "",
        postal_code: "10200",
        phone: "",
      };

      const res = await fetch(`${API_BASE}/api/confirm-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, items, user: userInfo }),
      });
      if (res.ok) {
        clearCart();
        setStatus("success");
      } else {
        setStatus("error");
      }
    };
    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-choSand flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-md text-center">
        {status === "confirming" && <p>Confirming your order...</p>}
        {status === "success" && (
          <>
            <h1 className="font-heading text-2xl mb-2">Thank you!</h1>
            <p className="mb-4">Your order has been placed successfully.</p>
            <Link
              to="/products"
              className="inline-block rounded-full bg-choForest text-white px-6 py-2 text-sm"
            >
              Continue shopping
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="font-heading text-2xl mb-2">Oops…</h1>
            <p className="mb-4">Something went wrong confirming your order.</p>
          </>
        )}
      </div>
    </main>
  );
}

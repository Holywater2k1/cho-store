import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!items.length) return;
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

    const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, user: userInfo }),
    });
    const data = await res.json();
    if (data.url) {
      window.location = data.url;
    }
  };

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl mb-6">Your cart</h1>

        {!items.length ? (
          <p className="text-sm text-gray-600">
            Your cart is empty. Browse{" "}
            <a href="/products" className="underline">
              all candles
            </a>
            .
          </p>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-[#f7f3e6] rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-heading text-base">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      {item.price} THB each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, Number(e.target.value))
                      }
                      className="w-16 border rounded px-2 py-1 text-sm bg-white"
                    />
                    <span className="w-20 text-right text-sm font-semibold">
                      {item.price * item.quantity} THB
                    </span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-[0.7rem] uppercase tracking-[0.15em] text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-black/10 pt-4">
              <p className="font-heading text-xl">Total: {total} THB</p>
              <button
                onClick={handleCheckout}
                className="rounded-full bg-choForest text-white px-7 py-2 text-sm hover:bg-black transition"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

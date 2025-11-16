import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL; // kept for future use

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!items.length) return;
    // force login first
    if (!user) {
      navigate("/auth", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  // Empty cart UI
  if (!items.length) {
    return (
      <main className="min-h-screen bg-choSand flex items-center justify-center px-4">
        <div className="glass-card px-6 py-7 max-w-sm w-full text-center">
          <p className="text-sm text-choForest/75 mb-3">
            Your cart is currently empty.
          </p>
          <p className="text-xs text-choForest/60 mb-5">
            Start with one scent for days and one for nights — you can always
            tweak later.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="btn-primary w-full text-sm"
          >
            Browse candles
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-choSand">
      <div className="page-shell py-8 sm:py-10">
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-choForest/60">
            Cart
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl mt-1">
            Your Cho selection
          </h1>
          <p className="text-sm text-choForest/75 mt-2">
            Adjust quantities or remove items before heading to checkout.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)]">
          {/* Left: items list */}
          <section className="page-section space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-[#f7f3e6] rounded-2xl border border-black/5 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="font-heading text-base">{item.name}</p>
                  <p className="text-xs text-choForest/60">
                    {item.price} THB each
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <label className="text-[0.7rem] text-choForest/60">
                      Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 1;
                        if (value < 1) return;
                        updateQuantity(item.productId, value);
                      }}
                      className="w-16 rounded-xl border border-black/10 bg-white/80 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-choClay/40"
                    />
                  </div>

                  {/* Line total */}
                  <span className="w-24 text-right text-sm font-semibold">
                    {item.price * item.quantity} THB
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="btn-ghost text-[0.7rem]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Right: order summary */}
          <aside className="page-section h-max space-y-4">
            <div>
              <h2 className="font-heading text-lg mb-1.5">
                Order summary
              </h2>
              <p className="text-xs text-choForest/65">
                Shipping and payment are confirmed on the next step.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items total</span>
                <span>{total} THB</span>
              </div>
              <div className="flex justify-between text-choForest/60">
                <span>Estimated shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-black/10 pt-3 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Total</span>
                <span>{total} THB</span>
              </div>

              <button
                onClick={handleCheckout}
                className="btn-primary w-full text-sm"
              >
                Proceed to checkout
              </button>

              <button
                type="button"
                onClick={() => navigate("/products")}
                className="btn-ghost w-full text-xs"
              >
                Continue shopping
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

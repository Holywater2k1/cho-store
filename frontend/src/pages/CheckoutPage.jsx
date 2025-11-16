import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    city: "",
    province: "",
    postal_code: "",
    payment_method: "cod", // cash on delivery
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // If not logged in once auth is done → send to login
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: "/checkout" } });
    }
  }, [user, loading, navigate]);

  // Preload profile data if available
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        setForm((f) => ({
          ...f,
          full_name: data.username || "",
          phone: data.phone || "",
          address_line1: data.address_line1 || "",
          city: data.city || "",
          province: data.province || "",
          postal_code: data.postal_code || "",
        }));
      }
    };
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !items.length) return;

    setSaving(true);
    setError("");

    try {
      // 1) create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          status: "pending", // you can use 'pending_payment', etc.
          full_name: form.full_name,
          phone: form.phone,
          address_line1: form.address_line1,
          city: form.city,
          province: form.province,
          postal_code: form.postal_code,
          payment_method: form.payment_method,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2) create order_items rows
      const itemsToInsert = items.map((item) => ({
  order_id: order.id,
  product_id: item.productId,
  product_name: item.name,             // 👈 add product_name
  quantity: item.quantity,
  unit_price: item.price,
  line_total: item.price * item.quantity,
}));


      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      clearCart();
      navigate("/orders");
    } catch (err) {
      console.error(err);
      setError("Failed to place order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // If cart is empty, reuse a nice empty state
  if (!items.length) {
    return (
      <main className="min-h-screen bg-choSand flex items-center justify-center px-4">
        <div className="glass-card px-6 py-7 max-w-sm w-full text-center">
          <p className="text-sm text-choForest/75 mb-3">
            Your cart is empty.
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
            Checkout
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl mt-1 mb-1.5">
            Delivery & payment
          </h1>
          <p className="text-sm text-choForest/75">
            We&apos;ll use these details to deliver your Cho candles safely.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)] items-start">
          {/* Left: Checkout form */}
          <section className="page-section">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* Contact */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="full_name">
                    Full name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="phone">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="field-label" htmlFor="address_line1">
                  Address
                </label>
                <input
                  id="address_line1"
                  name="address_line1"
                  value={form.address_line1}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="House number, street, building"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="field-label" htmlFor="city">
                    City / District
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="province">
                    Province
                  </label>
                  <input
                    id="province"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="postal_code">
                    Postal code
                  </label>
                  <input
                    id="postal_code"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              {/* Payment */}
              <div>
                <label className="field-label" htmlFor="payment_method">
                  Payment method
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="cod">Cash on delivery</option>
                  <option value="bank_transfer">Bank transfer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full mt-2"
              >
                {saving ? "Placing your order..." : "Place order"}
              </button>
            </form>
          </section>

          {/* Right: Order summary */}
          <aside className="page-section h-max space-y-4">
            <div>
              <h2 className="font-heading text-lg mb-1.5">
                Order summary
              </h2>
              <p className="text-xs text-choForest/65">
                Review your items before confirming.
              </p>
            </div>

            <ul className="space-y-2 text-sm">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex justify-between text-choForest/85"
                >
                  <span className="max-w-[60%]">
                    {item.name} &times; {item.quantity}
                  </span>
                  <span>{item.price * item.quantity} THB</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-black/10 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-choForest/75">
                <span>Items total</span>
                <span>{total} THB</span>
              </div>
              <div className="flex justify-between text-choForest/60">
                <span>Estimated shipping</span>
                <span>Calculated after address</span>
              </div>
            </div>

            <div className="border-t border-black/10 pt-3 flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{total} THB</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

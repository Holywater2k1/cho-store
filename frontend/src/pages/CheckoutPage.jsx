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

  // if not logged in, go to auth
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: "/checkout" } });
    }
  }, [user, loading, navigate]);

  // preload profile data if available
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

      // 2) create order_items
      const itemsToInsert = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
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

  if (!items.length) {
    return (
      <main className="min-h-screen bg-choSand flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Your cart is empty.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="rounded-full bg-choForest text-white px-6 py-2 text-sm"
          >
            Browse candles
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-5xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-[3fr,2fr]">
        {/* DELIVERY FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
        >
          <h1 className="font-heading text-2xl mb-2">Delivery details</h1>
          <p className="text-xs text-gray-600 mb-4">
            We’ll use this information to deliver your order.
          </p>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1">
              Full name
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Phone number
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Address
            </label>
            <input
              name="address_line1"
              value={form.address_line1}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Street, building, house number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                City
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Province
              </label>
              <input
                name="province"
                value={form.province}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Postal code
              </label>
              <input
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Payment method
            </label>
            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="cod">Cash on delivery</option>
              <option value="bank_transfer">Bank transfer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-full bg-choForest text-white px-6 py-2 text-sm disabled:opacity-60"
          >
            {saving ? "Placing order..." : "Place order"}
          </button>
        </form>

        {/* ORDER SUMMARY */}
        <aside className="bg-[#f7f3e6] rounded-2xl p-6 shadow-sm">
          <h2 className="font-heading text-xl mb-3">Order summary</h2>
          <ul className="space-y-3 mb-4 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between">
                <span>
                  {item.name} &times; {item.quantity}
                </span>
                <span>{item.price * item.quantity} THB</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-black/10 pt-3 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{total} THB</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

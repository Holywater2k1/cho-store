import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_OPTIONS = ["pending", "processing", "delivering", "completed", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [itemsByOrder, setItemsByOrder] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Failed to load orders.");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setSavingId(orderId);
    setError("");

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error(error);
      setError("Failed to update status.");
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
    setSavingId(null);
  };

  const toggleExpand = async (order) => {
    if (expandedId === order.id) {
      setExpandedId(null);
      return;
    }

    // load items if not loaded yet
    if (!itemsByOrder[order.id]) {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, quantity, unit_price, products(name)")
        .eq("order_id", order.id);

      if (error) {
        console.error(error);
      } else {
        setItemsByOrder((prev) => ({
          ...prev,
          [order.id]: data || [],
        }));
      }
    }

    setExpandedId(order.id);
  };

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl mb-2">Admin · Orders</h1>
        <p className="text-sm text-gray-600 mb-6">
          View all orders and update their delivery status.
        </p>

        {error && (
          <p className="mb-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-gray-600">Loading orders...</p>
        ) : !orders.length ? (
          <p className="text-sm text-gray-600">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <article
                key={o.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      #{o.id.slice(0, 8)} ·{" "}
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                    <p className="font-heading text-sm mb-1">
                      {o.full_name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {o.address_line1}, {o.city}, {o.province} {o.postal_code}
                    </p>
                    <p className="text-[0.7rem] text-gray-500 mt-1">
                      Payment: {o.payment_method || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {o.total_amount} THB
                      </p>
                      <p className="text-[0.7rem] text-gray-500">
                        Status:
                      </p>
                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o.id, e.target.value)
                        }
                        disabled={savingId === o.id}
                        className="mt-1 border rounded px-2 py-1 text-xs bg-white"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => toggleExpand(o)}
                      className="text-[0.7rem] uppercase tracking-[0.15em] text-choForest hover:text-black"
                    >
                      {expandedId === o.id ? "Hide items" : "View items"}
                    </button>
                  </div>
                </div>

                {expandedId === o.id && (
                  <div className="mt-4 border-t border-black/5 pt-3">
                    <p className="text-xs text-gray-700 mb-2">
                      Order items
                    </p>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {(itemsByOrder[o.id] || []).map((it) => (
                        <li
                          key={it.id}
                          className="flex justify-between gap-2"
                        >
                          <span>
                            {it.products?.name || "Product"} × {it.quantity}
                          </span>
                          <span>
                            {it.unit_price * it.quantity} THB
                          </span>
                        </li>
                      ))}
                      {!itemsByOrder[o.id]?.length && (
                        <li className="text-gray-500">
                          No items found (check order_items table).
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// src/pages/AdminOrdersPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_OPTIONS = [
  { value: "pending", label: "pending" },
  { value: "processing", label: "processing" },
  { value: "delivering", label: "delivering" },
  { value: "completed", label: "completed" },
  // 👇 still value "cancelled", just clearer label
  { value: "cancelled", label: "cancelled by customer" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [itemsByOrder, setItemsByOrder] = useState({});
  const [error, setError] = useState("");

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

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
        .select("*, products(*)")
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

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const text = [
        o.id,
        o.full_name,
        o.city,
        o.province,
        o.address_line1,
        o.payment_method,
      ]
        .join(" ")
        .toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-choSand">
      <div className="page-shell py-8">
        <div className="page-section mb-4">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-choForest/60 mb-1">
            Admin
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl mb-2">
            Orders overview
          </h1>
          <p className="text-xs sm:text-sm text-choForest/70">
            View all orders and update their delivery status.
          </p>

          {error && (
            <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="page-section">
          {loading ? (
            <div className="glass-card px-4 py-4 text-sm text-choForest/70">
              Loading orders...
            </div>
          ) : !orders.length ? (
            <div className="glass-card px-4 py-5 text-sm text-choForest/75">
              No orders yet.
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field max-w-[160px] py-1.5 text-xs"
                  >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Search order, name, address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field max-w-xs py-1.5 text-xs"
                  />
                </div>
                <p className="text-[0.7rem] text-choForest/60">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((o) => (
                  <article
                    key={o.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-black/5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="text-[0.7rem] text-gray-500 mb-1">
                          #{o.id.slice(0, 8)} ·{" "}
                          {new Date(o.created_at).toLocaleString()}
                        </p>
                        <p className="font-heading text-sm mb-1">
                          {o.full_name || "Customer"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {o.address_line1}, {o.city}, {o.province}{" "}
                          {o.postal_code}
                        </p>
                        <p className="text-[0.7rem] text-gray-500 mt-1">
                          Payment: {o.payment_method || "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {o.total_amount} THB
                          </p>
                          <p className="text-[0.7rem] text-gray-500">
                            Status
                          </p>
                          <select
                            value={o.status}
                            onChange={(e) =>
                              handleStatusChange(o.id, e.target.value)
                            }
                            disabled={savingId === o.id}
                            className="mt-1 border border-black/10 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-choClay/40"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(o)}
                          className="self-end text-[0.7rem] uppercase tracking-[0.15em] text-choForest hover:text-black"
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
                                {it.products?.name || "Product"} ×{" "}
                                {it.quantity}
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

                {!filteredOrders.length && (
                  <p className="text-xs text-choForest/60">
                    No orders match these filters.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

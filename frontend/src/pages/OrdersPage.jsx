// frontend/src/pages/OrdersPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // ---------- load orders (with items) ----------
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        // 👇 pull order_items as a nested array on each order
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load orders.");
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const refreshOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  };

  const updateStatus = async (orderId, status, extra = {}) => {
    setSavingId(orderId);
    setError("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, ...extra })
        .eq("id", orderId);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      await refreshOrders();
    } catch (err) {
      console.error(err);
      setError("Failed to update order. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  // ---------- user actions ----------

  // user confirms they are happy (you already wired this to "accepted" or "well_received")
  const handleAccept = (order) => {
    // keep your existing status here
    updateStatus(order.id, "well_received");
  };

  // user cancels order (before delivery)
  const handleCancel = (order) => {
    const canCancel =
      order.status === "pending" || order.status === "preparing";

    if (!canCancel) return;

    const ok = window.confirm("Cancel this order? This cannot be undone.");
    if (!ok) return;

    updateStatus(order.id, "cancelled");
  };

  // go to “never received” form
  const handleNeverReceived = (order) => {
    navigate(`/orders/${order.id}/issue`);
  };

  // go to refund form
  const handleRefund = (order) => {
    navigate(`/orders/${order.id}/refund`);
  };

  // ---------- split into sections ----------

  const activeOrders = orders.filter(
    (o) =>
      o.status !== "well_received" && // or "accepted" in your DB; keep consistent
      o.status !== "lost" &&
      o.status !== "refund_requested" &&
      o.status !== "cancelled"
  );

  const historyOrders = orders.filter(
    (o) =>
      o.status === "well_received" ||
      o.status === "lost" ||
      o.status === "refund_requested" ||
      o.status === "cancelled"
  );

  return (
    <main className="min-h-screen bg-choSand">
      <div className="page-shell pt-8 pb-12">
        <div className="page-section mb-4">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-choForest/60 mb-1">
            Orders
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl mb-2">
            Your orders
          </h1>
          <p className="text-xs sm:text-sm text-choForest/70">
            Track your previous purchases and see what&apos;s on the way.
          </p>

          {error && (
            <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {loading ? (
          <div className="page-section">
            <div className="glass-card px-4 py-4 text-sm text-choForest/70">
              Loading your orders...
            </div>
          </div>
        ) : !orders.length ? (
          <div className="page-section">
            <div className="glass-card px-5 py-6 max-w-md">
              <p className="text-sm text-choForest/80 mb-2">
                You don&apos;t have any orders yet.
              </p>
              <p className="text-xs text-choForest/60 mb-4">
                When you place an order, it will appear here with its delivery
                status.
              </p>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="btn-primary text-sm w-full sm:w-auto"
              >
                Browse candles
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ========= ACTIVE ========= */}
            <section className="page-section space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading text-sm sm:text-base text-choForest">
                  In progress
                </h2>
                <p className="text-[0.7rem] text-choForest/60">
                  Orders that are being prepared or delivered.
                </p>
              </div>

              {activeOrders.length === 0 && (
                <p className="text-xs text-choForest/60">
                  You don&apos;t have any active orders yet.
                </p>
              )}

              <div className="space-y-3">
                {activeOrders.map((order) => {
                  const canCancel =
                    order.status === "pending" ||
                    order.status === "preparing";

                  return (
                    <article
                      key={order.id}
                      className="bg-white rounded-2xl px-5 py-4 shadow-sm flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p className="text-[0.65rem] text-gray-500 mb-1">
                          #{order.id.slice(0, 8)} ·{" "}
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm font-semibold mb-1">
                          {order.full_name} · {order.city}, {order.province}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          {order.address_line1}
                        </p>

                        {/* 🔹 Order items list */}
                        <OrderItemsList order={order} />
                      </div>

                      <div className="text-right space-y-2 min-w-[180px]">
                        <p className="text-sm font-semibold">
                          {order.total_amount} THB
                        </p>

                        {/* Status pill */}
                        <p className="inline-flex items-center justify-end rounded-full bg-choForest/5 text-choForest text-[0.7rem] px-3 py-1">
                          {order.status === "pending" && "Pending"}
                          {order.status === "preparing" && "Preparing"}
                          {order.status === "shipped" && "On the way"}
                          {order.status === "delivered" && "Delivered"}
                          {order.status === "completed" &&
                            "Delivered – please confirm"}
                          {["pending", "preparing", "shipped", "delivered", "completed"].indexOf(
                            order.status
                          ) === -1 && order.status}
                        </p>

                        {/* Delivery proof */}
                        {order.delivery_proof_url && (
                          <button
                            type="button"
                            onClick={() =>
                              window.open(order.delivery_proof_url, "_blank")
                            }
                            className="block ml-auto text-[0.7rem] text-choForest underline underline-offset-2"
                          >
                            View delivery proof
                          </button>
                        )}

                        {/* Completed: let user confirm or report issue */}
                        {order.status === "completed" && (
                          <div className="mt-2 flex flex-wrap gap-2 justify-end text-xs">
                            <button
                              disabled={savingId === order.id}
                              onClick={() => handleAccept(order)}
                              className="rounded-full bg-choForest text-white px-3 py-1 disabled:opacity-60"
                            >
                              {savingId === order.id
                                ? "Saving..."
                                : "Receive"}
                            </button>

                            <button
                              disabled={savingId === order.id}
                              onClick={() => handleNeverReceived(order)}
                              className="rounded-full border border-gray-400 px-3 py-1 text-gray-700 disabled:opacity-60"
                            >
                              Never received
                            </button>

                            <button
                              disabled={savingId === order.id}
                              onClick={() => handleRefund(order)}
                              className="rounded-full border border-red-500 text-red-600 px-3 py-1 disabled:opacity-60"
                            >
                              Refund / return
                            </button>
                          </div>
                        )}

                        {/* Pending/preparing: allow cancel */}
                        {canCancel && order.status !== "completed" && (
                          <div className="mt-2 flex justify-end">
                            <button
                              disabled={savingId === order.id}
                              onClick={() => handleCancel(order)}
                              className="text-[0.7rem] rounded-full border border-gray-400 px-3 py-1 text-gray-700 disabled:opacity-60"
                            >
                              {savingId === order.id
                                ? "Cancelling..."
                                : "Cancel order"}
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* ========= HISTORY ========= */}
            <section className="page-section space-y-3">
              <h2 className="font-heading text-sm sm:text-base text-choForest">
                History
              </h2>

              {historyOrders.length === 0 && (
                <p className="text-xs text-choForest/60">
                  You don&apos;t have any completed orders yet.
                </p>
              )}

              <div className="space-y-3">
                {historyOrders.map((order) => (
                  <article
                    key={order.id}
                    className="bg-white rounded-2xl px-5 py-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="flex-1">
                      <p className="text-[0.65rem] text-gray-500 mb-1">
                        #{order.id.slice(0, 8)} ·{" "}
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm font-semibold mb-1">
                        {order.full_name} · {order.city}, {order.province}
                      </p>

                      {/* 🔹 Order items in history too */}
                      <OrderItemsList order={order} />
                    </div>

                    <div className="text-right space-y-1 min-w-[180px]">
                      <p className="text-sm font-semibold">
                        {order.total_amount} THB
                      </p>

                      {order.status === "well_received" && (
                        <span className="inline-flex items-center justify-end rounded-full bg-emerald-50 text-emerald-700 text-[0.7rem] px-3 py-1">
                          Well received
                        </span>
                      )}
                      {order.status === "lost" && (
                        <span className="inline-flex items-center justify-end rounded-full bg-amber-50 text-amber-700 text-[0.7rem] px-3 py-1">
                          Problem reported
                        </span>
                      )}
                      {order.status === "refund_requested" && (
                        <span className="inline-flex items-center justify-end rounded-full bg-red-50 text-red-600 text-[0.7rem] px-3 py-1">
                          Refund / return requested
                        </span>
                      )}
                      {order.status === "cancelled" && (
                        <span className="inline-flex items-center justify-end rounded-full bg-gray-100 text-gray-600 text-[0.7rem] px-3 py-1">
                          Cancelled by you
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function OrderItemsList({ order }) {
  const items = order.order_items || [];
  if (!items.length) return null;

  return (
    <ul className="mt-1 text-[0.7rem] text-gray-700 space-y-1">
      {items.map((item) => {
        const name =
          item.product_name || // denormalised name in order_items
          item.name || // generic name column
          item.products?.name || // if you later join products in Supabase
          "Unnamed item";

        const size =
          item.size_snapshot || // if you saved size at checkout
          item.size ||
          item.products?.size ||
          null;

        const price =
          item.unit_price ?? // typical name in order_items
          item.price ??
          null;

        return (
          <li key={item.id} className="flex justify-between gap-2">
            <span>
              {name}
              {size ? ` · ${size}` : ""}
            </span>
            <span className="ml-2">
              x{item.quantity}
              {price !== null ? ` · ${price} THB` : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: "/orders" } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setOrders(data || []);
      } else {
        console.error(error);
      }
      setLoadingOrders(false);
    };
    loadOrders();
  }, [user]);

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-choSand flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl mb-4">Your orders</h1>
        <p className="text-sm text-gray-600 mb-6">
          Track your previous purchases and see what&apos;s on the way.
        </p>

        {loadingOrders ? (
          <p className="text-sm text-gray-600">Loading orders...</p>
        ) : !orders.length ? (
          <p className="text-sm text-gray-600">
            You don&apos;t have any orders yet.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <article
                key={o.id}
                className="bg-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    #{o.id.slice(0, 8)} ·{" "}
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                  <p className="font-heading text-base mb-1">
                    {o.full_name || "Your order"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {o.address_line1}, {o.city}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">
                    {o.total_amount} THB
                  </span>
                  <StatusPill status={o.status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusPill({ status }) {
  let label = status;
  let style = "bg-gray-100 text-gray-700";

  if (status === "pending") {
    label = "Pending";
    style = "bg-amber-50 text-amber-700";
  } else if (status === "delivering") {
    label = "On the way";
    style = "bg-blue-50 text-blue-700";
  } else if (status === "completed") {
    label = "Delivered";
    style = "bg-emerald-50 text-emerald-700";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${style}`}>
      {label}
    </span>
  );
}

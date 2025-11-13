import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: "/notifications" } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`is_global.eq.true,user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!error) setNotifications(data || []);
    };
    load();
  }, [user]);

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl mb-4">Notifications</h1>
        <p className="text-sm text-gray-600 mb-6">
          Offers, new arrivals and updates from Cho.
        </p>

        {!notifications.length ? (
          <p className="text-sm text-gray-600">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <article
                key={n.id}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
                <h2 className="font-heading text-base mb-1">
                  {n.title}
                </h2>
                <p className="text-sm text-gray-700">{n.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

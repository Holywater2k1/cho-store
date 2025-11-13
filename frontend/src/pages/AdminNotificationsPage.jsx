import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "promo", // promo / info / system
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) setNotifications(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.from("notifications").insert({
        title: form.title,
        body: form.body,
        type: form.type,
        is_global: true, // send to everyone
        user_id: null,
      });

      if (error) throw error;

      setMessage("Notification sent to all users.");
      setForm({ title: "", body: "", type: "promo" });
      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl mb-2">Admin · Notifications</h1>
        <p className="text-sm text-gray-600 mb-6">
          Send offers, discounts and updates to all Cho users.
        </p>

        {message && (
          <p className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* FORM */}
        <section className="bg-white rounded-2xl p-6 shadow-sm mb-10">
          <h2 className="font-heading text-xl mb-4">Send notification</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="promo">Promo / discount</option>
                <option value="info">Info update</option>
                <option value="system">System message</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Example: 10% off new arrivals"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Message
              </label>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                required
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Short description of the offer or update."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-choForest text-white px-6 py-2 text-sm disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send to all users"}
            </button>
          </form>
        </section>

        {/* RECENT NOTIFICATIONS */}
        <section>
          <h2 className="font-heading text-xl mb-3">Recent notifications</h2>
          <div className="space-y-2">
            {notifications.map((n) => (
              <article
                key={n.id}
                className="bg-white rounded-xl p-4 shadow-sm text-sm"
              >
                <p className="text-[0.7rem] text-gray-500 mb-1">
                  {new Date(n.created_at).toLocaleString()} · {n.type}
                </p>
                <p className="font-heading text-sm mb-1">{n.title}</p>
                <p className="text-xs text-gray-700">{n.body}</p>
              </article>
            ))}
            {!notifications.length && (
              <p className="text-xs text-gray-600">
                No notifications yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

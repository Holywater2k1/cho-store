// src/pages/AdminNotificationsPage.jsx
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

  // filters
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

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

  const handleDelete = async (notif) => {
    const ok = window.confirm(
      `Delete notification "${notif.title}"? This cannot be undone.`
    );
    if (!ok) return;

    setSending(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notif.id);

      if (error) throw error;

      setMessage("Notification deleted.");
      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete notification.");
    } finally {
      setSending(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType !== "all" && n.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      const text = `${n.title || ""} ${n.body || ""} ${n.type || ""}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-choSand">
      <div className="page-shell py-8 space-y-6">
        {/* HEADER */}
        <div className="page-section">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-choForest/60 mb-1">
            Admin
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl mb-1">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-choForest/70 mb-3">
            Send offers, discounts and updates to all Cho users.
          </p>

          {message && (
            <p className="mb-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              {message}
            </p>
          )}
          {error && (
            <p className="mb-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* FORM */}
        <section className="page-section">
          <h2 className="font-heading text-lg sm:text-xl mb-4">
            Send notification
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="type">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="promo">Promo / discount</option>
                <option value="info">Info update</option>
                <option value="system">System message</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Notification title"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="body">
                Message
              </label>
              <textarea
                id="body"
                name="body"
                value={form.body}
                onChange={handleChange}
                required
                rows={3}
                className="input-field min-h-[100px] resize-y"
                placeholder="Short description of the offer or update."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-primary text-sm"
            >
              {sending ? "Sending..." : "Send to all users"}
            </button>
          </form>
        </section>

        {/* RECENT NOTIFICATIONS */}
        <section className="page-section">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="font-heading text-lg sm:text-xl">
              Recent notifications
            </h2>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field max-w-[150px] py-1.5 text-xs"
              >
                <option value="all">All types</option>
                <option value="promo">Promo</option>
                <option value="info">Info</option>
                <option value="system">System</option>
              </select>
              <input
                type="text"
                placeholder="Search title or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field max-w-xs py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredNotifications.map((n) => (
              <article
                key={n.id}
                className="bg-[#f7f3e6] rounded-2xl p-4 border border-black/5 text-sm flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              >
                <div className="flex-1">
                  <p className="text-[0.7rem] text-choForest/60 mb-1">
                    {new Date(n.created_at).toLocaleString()} · {n.type}
                  </p>
                  <p className="font-heading text-sm mb-1">{n.title}</p>
                  <p className="text-xs text-choForest/80">{n.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(n)}
                  className="btn-ghost text-[0.7rem] text-red-600 self-start"
                  disabled={sending}
                >
                  Delete
                </button>
              </article>
            ))}
            {!filteredNotifications.length && (
              <p className="text-xs text-choForest/60">
                No notifications match these filters.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

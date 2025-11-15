// frontend/src/pages/OrderIssueFormPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function OrderIssueFormPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [confirmItems, setConfirmItems] = useState(false);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load order details
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (error) {
        console.error(error);
        setError("Failed to load order.");
      } else {
        setOrder(data);
      }
    };

    load();
  }, [orderId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to send a report.");
      return;
    }

    if (!confirmItems) {
      setError("Please confirm that this order information is correct.");
      return;
    }

    if (!reason.trim()) {
      setError("Please describe what happened.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let photo_url = null;

      // upload optional image to "order-issues" bucket
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `issues/${orderId}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("order-issues")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("order-issues")
          .getPublicUrl(path);

        photo_url = data.publicUrl;
      }

      // insert into order_issues table
      const { error: insertError } = await supabase
        .from("order_issues")
        .insert({
          order_id: orderId,
          user_id: user.id,
          description: reason,
          photo_url,
        });

      if (insertError) throw insertError;

      // mark order as "lost" / problem reported
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "lost" })
        .eq("id", orderId);

      if (updateError) throw updateError;

      navigate("/orders");
    } catch (err) {
      console.error(err);
      setError("Failed to send report. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-choSand pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-heading text-2xl mb-4">Report a delivery issue</h1>

        {order && (
          <div className="mb-4 text-xs bg-white rounded-xl px-4 py-3 shadow-sm">
            <p className="text-gray-600 mb-1">
              Order #{order.id.slice(0, 8)} – {order.full_name}
            </p>
            <p className="text-gray-500">
              {order.address_line1}, {order.city}, {order.province}{" "}
              {order.postal_code}
            </p>
          </div>
        )}

        {error && (
          <p className="mb-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white rounded-2xl p-5 shadow-sm text-sm"
        >
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={confirmItems}
              onChange={(e) => setConfirmItems(e.target.checked)}
              className="mt-1"
            />
            <span>
              I confirm this is my correct order and the items listed in the
              order are correct.
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold mb-1">
              What happened?
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Tell us what went wrong so support or admin can help."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Add a photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-red-600 text-white px-6 py-2 text-xs disabled:opacity-60"
          >
            {saving ? "Sending..." : "Send report"}
          </button>
        </form>
      </div>
    </main>
  );
}

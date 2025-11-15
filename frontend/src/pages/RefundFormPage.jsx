import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RefundFormPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (!error) setOrder(data);
    };
    load();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let proof_url = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `refunds/${orderId}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("order-issues")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("order-issues")
          .getPublicUrl(path);

        proof_url = data.publicUrl;
      }

      const { error } = await supabase.from("refund_requests").insert({
        order_id: orderId,
        reason,
        image_url: proof_url,
      });

      if (error) throw error;

      await supabase
        .from("orders")
        .update({ status: "refund_requested" })
        .eq("id", orderId);

      navigate("/orders");
    } catch (err) {
      console.error(err);
      setError("Failed to send refund request. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-choSand pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-heading text-2xl mb-4">
          Request a refund / return
        </h1>

        {order && (
          <div className="mb-4 text-xs bg-white rounded-xl px-4 py-3 shadow-sm">
            <p className="text-gray-600 mb-1">
              Order #{order.id.slice(0, 8)} – {order.full_name}
            </p>
            <p className="text-gray-500">
              Total: {order.total_amount} THB · Status: {order.status}
            </p>
          </div>
        )}

        {error && (
          <p className="mb-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-5 shadow-sm text-sm">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Why do you want a refund or return?
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Example: damaged package, wrong scent, candle not working properly, etc."
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
            className="rounded-full bg-choForest text-white px-6 py-2 text-xs disabled:opacity-60"
          >
            {saving ? "Sending..." : "Submit request"}
          </button>
        </form>
      </div>
    </main>
  );
}

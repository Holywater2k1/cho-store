import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    phone: "",
    address_line1: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Thailand",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [locked, setLocked] = useState(false); // when delivering, prevent edits

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: "/profile" } });
    }
  }, [user, loading, navigate]);

  // Load profile + delivery status
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setError("");
      setInfo("");

      // 1) check if user has any order with status 'delivering'
      const { data: deliveringOrders, error: orderError } = await supabase
        .from("orders")
        .select("id,status")
        .eq("user_id", user.id)
        .eq("status", "delivering");

      if (orderError) {
        console.error(orderError);
      } else if (deliveringOrders && deliveringOrders.length > 0) {
        setLocked(true);
        setInfo(
          "You have an order currently out for delivery. Address changes are temporarily locked."
        );
      }

      // 2) load profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
        setError("Failed to load profile.");
        return;
      }

      if (profile) {
        setForm({
          username: profile.username || "",
          phone: profile.phone || "",
          address_line1: profile.address_line1 || "",
          city: profile.city || "",
          province: profile.province || "",
          postal_code: profile.postal_code || "",
          country: profile.country || "Thailand",
        });
      } else {
        // no profile yet -> create empty row
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
        });
        if (insertError) {
          console.error(insertError);
        }
      }
    };

    load();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (locked) {
      setInfo(
        "Profile is locked while an order is out for delivery. Try again after it is completed."
      );
      return;
    }

    setSaving(true);
    setError("");
    setInfo("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: form.username,
        phone: form.phone,
        address_line1: form.address_line1,
        city: form.city,
        province: form.province,
        postal_code: form.postal_code,
        country: form.country,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      setError("Failed to save profile.");
    } else {
      setInfo("Profile updated successfully.");
    }

    setSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-choSand flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl mb-2">Your profile</h1>
        <p className="text-sm text-gray-600 mb-6">
          We use these details for your orders and delivery.
        </p>

        {info && (
          <p className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            {info}
          </p>
        )}
        {locked && (
          <p className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            You have an order that is currently out for delivery. Address
            changes are disabled until it is completed.
          </p>
        )}
        {error && (
          <p className="mb-4 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={locked}
              className="w-full border rounded px-3 py-2 text-sm bg-white disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Phone number <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={locked}
              className="w-full border rounded px-3 py-2 text-sm bg-white disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Address
            </label>
            <input
              type="text"
              name="address_line1"
              value={form.address_line1}
              onChange={handleChange}
              disabled={locked}
              className="w-full border rounded px-3 py-2 text-sm bg-white disabled:bg-gray-100"
              placeholder="Street, building, house number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={locked}
                className="w-full border rounded px-3 py-2 text-sm bg-white disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Province
              </label>
              <input
                type="text"
                name="province"
                value={form.province}
                onChange={handleChange}
                disabled={locked}
                className="w-full border rounded px-3 py-2 text-sm bg-white disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Postal code
              </label>
              <input
                type="text"
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                disabled={locked}
                className="w-full border rounded px-3 py-2 text-sm bg-white disabled:bg-gray-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              disabled={locked}
              className="w-full border rounded px-3 py-2 text-sm bg-white disabled:bg-gray-100"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || locked}
              className="rounded-full bg-choForest text-white px-6 py-2 text-sm disabled:opacity-60"
            >
              {locked
                ? "Profile locked"
                : saving
                ? "Saving..."
                : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

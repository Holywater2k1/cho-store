import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "product-images";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    mood: "Calm",
    size: "200g glass jar",
    price: 420,
    stock: 0,
    is_best_seller: false,
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null); // null = adding, not editing

  const moods = ["Calm", "Focus", "Dream"];
  const sizes = ["180g tin", "200g glass jar", "250g matte jar"];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Failed to load products.");
      return;
    }
    setProducts(data || []);
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      mood: "Calm",
      size: "200g glass jar",
      price: 420,
      stock: 0,
      is_best_seller: false,
      image_url: "",
    });
    setImageFile(null);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" || name === "stock"
          ? Number(value)
          : value,
    }));
  };

  const handleNameBlur = () => {
    if (!form.slug && form.name) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setForm((f) => ({ ...f, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      let image_url = form.image_url || null;

      // If a new image is chosen, upload and override
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filePath = `admin-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(filePath);

        image_url = publicData.publicUrl;
      }

      const payload = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        mood: form.mood,
        size: form.size,
        price: Number(form.price),
        stock: Number(form.stock),
        is_best_seller: form.is_best_seller,
        image_url,
      };

      if (editingId) {
        // UPDATE
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);

        if (updateError) throw updateError;
        setMessage("Product updated successfully.");
      } else {
        // INSERT
        const { error: insertError } = await supabase
          .from("products")
          .insert(payload);

        if (insertError) throw insertError;
        setMessage("Product added successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      mood: product.mood || "Calm",
      size: product.size || "200g glass jar",
      price: product.price || 0,
      stock: product.stock ?? 0,
      is_best_seller: product.is_best_seller || false,
      image_url: product.image_url || "",
    });
    setImageFile(null);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (product) => {
    const ok = window.confirm(
      `Delete product "${product.name}"? This cannot be undone.`
    );
    if (!ok) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) throw deleteError;
      setMessage("Product deleted.");
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl mb-2">Admin · Products</h1>
        <p className="text-sm text-gray-600 mb-6">
          Add, edit, remove candles and control stock from here.
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl">
              {editingId ? "Edit product" : "Add a new product"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[0.7rem] uppercase tracking-[0.15em] text-gray-600 hover:text-choForest"
              >
                + New product
              </button>
            )}
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleNameBlur}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Slug
              </label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="auto-generated from name"
              />
              <p className="text-[0.65rem] text-gray-500 mt-1">
                Used in URLs, must be unique (e.g. <code>midnight-library</code>).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Mood
              </label>
              <select
                name="mood"
                value={form.mood}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {moods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Size
              </label>
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Price (THB)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min={0}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Stock / quantity
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                min={0}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                id="is_best_seller"
                type="checkbox"
                name="is_best_seller"
                checked={form.is_best_seller}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label
                htmlFor="is_best_seller"
                className="text-xs text-gray-700"
              >
                Mark as best seller
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">
                Product image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
              {form.image_url && !imageFile && (
                <p className="text-[0.65rem] text-gray-500 mt-1">
                  Current image will stay unless you upload a new one.
                </p>
              )}
              <p className="text-[0.65rem] text-gray-500">
                Upload to <code>{BUCKET}</code> bucket automatically.
              </p>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-choForest text-white px-6 py-2 text-sm disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update product"
                  : "Add product"}
              </button>
            </div>
          </form>
        </section>

        {/* LIST */}
        <section>
          <h2 className="font-heading text-xl mb-3">Existing products</h2>
          <div className="space-y-3">
            {products.map((p) => (
              <article
                key={p.id}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-heading text-sm">{p.name}</p>
                    <p className="text-[0.7rem] text-gray-500">
                      {p.slug} · {p.mood} · {p.size}
                    </p>
                    <p className="text-[0.7rem] text-gray-500">
                      Stock: {p.stock ?? 0}
                    </p>
                    {p.is_best_seller && (
                      <span className="text-[0.65rem] text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded-full mt-1">
                        Best seller
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold mr-2">
                    {p.price} THB
                  </p>
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-[0.7rem] uppercase tracking-[0.15em] text-choForest hover:text-black"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="text-[0.7rem] uppercase tracking-[0.15em] text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

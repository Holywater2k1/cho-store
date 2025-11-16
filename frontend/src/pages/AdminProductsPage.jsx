// src/pages/AdminProductsPage.jsx
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
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null); // null = adding

  const moods = ["Calm", "Focus", "Dream"];
  const sizes = ["180g tin", "200g glass jar", "250g matte jar"];

  // filters
  const [moodFilter, setMoodFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [search, setSearch] = useState("");

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
    setImagePreview("");
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

  const handleImageInput = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      let image_url = form.image_url || null;

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
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);

        if (updateError) throw updateError;
        setMessage("Product updated successfully.");
      } else {
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
    setImagePreview(product.image_url || "");
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

  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, p) => sum + (p.stock ?? 0),
    0
  );

  const filteredProducts = products.filter((p) => {
    if (moodFilter !== "all" && p.mood !== moodFilter) return false;
    if (sizeFilter !== "all" && p.size !== sizeFilter) return false;
    if (stockFilter === "in" && (!p.stock || p.stock <= 0)) return false;
    if (stockFilter === "out" && (p.stock || 0) > 0) return false;
    if (search) {
      const q = search.toLowerCase();
      const text = `${p.name} ${p.slug} ${p.mood} ${p.size} ${p.description || ""}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-choSand">
      <div className="page-shell py-8 space-y-6">
        {/* HEADER + STATS */}
        <div className="page-section">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.25em] text-choForest/60 mb-1">
                Admin
              </p>
              <h1 className="font-heading text-2xl sm:text-3xl mb-1">
                Products
              </h1>
              <p className="text-xs sm:text-sm text-choForest/70">
                Add, edit, remove candles and control stock from here.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#f7f3e6] rounded-2xl px-4 py-3 border border-black/5">
                <p className="text-[0.7rem] text-choForest/60 uppercase tracking-[0.18em] mb-1">
                  Total products
                </p>
                <p className="font-heading text-xl">{totalProducts}</p>
              </div>
              <div className="bg-[#f7f3e6] rounded-2xl px-4 py-3 border border-black/5">
                <p className="text-[0.7rem] text-choForest/60 uppercase tracking-[0.18em] mb-1">
                  Total units in stock
                </p>
                <p className="font-heading text-xl">{totalStock}</p>
              </div>
            </div>
          </div>

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
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="font-heading text-lg sm:text-xl">
              {editingId ? "Edit product" : "Add a new product"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-ghost text-[0.7rem] uppercase tracking-[0.15em]"
              >
                + New product
              </button>
            )}
          </div>

          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleNameBlur}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                className="input-field"
              />
              <p className="mt-1 text-[0.7rem] text-choForest/60">
                Used in URLs. Auto-filled from name if left empty.
              </p>
            </div>

            <div>
              <label className="field-label" htmlFor="mood">
                Mood
              </label>
              <select
                id="mood"
                name="mood"
                value={form.mood}
                onChange={handleChange}
                className="input-field"
              >
                {moods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="size">
                Size / vessel
              </label>
              <select
                id="size"
                name="size"
                value={form.size}
                onChange={handleChange}
                className="input-field"
              >
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="price">
                Price (THB)
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="stock">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 mt-3">
              <input
                id="is_best_seller"
                type="checkbox"
                name="is_best_seller"
                checked={form.is_best_seller}
                onChange={handleChange}
                className="w-4 h-4 rounded border border-black/20"
              />
              <label
                htmlFor="is_best_seller"
                className="text-xs text-choForest/80"
              >
                Mark as best seller
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="field-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
                className="input-field min-h-[100px] resize-y"
              />
            </div>

            <div className="md:col-span-2">
              <label className="field-label" htmlFor="image">
                Product image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageInput}
                className="block w-full text-xs text-choForest/80"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 h-20 w-20 rounded-xl object-cover border border-black/10"
                />
              )}
              {form.image_url && !imageFile && !imagePreview && (
                <p className="text-[0.65rem] text-choForest/60 mt-1">
                  Current image will stay unless you upload a new one.
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-sm"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save changes"
                  : "Add product"}
              </button>
            </div>
          </form>
        </section>

        {/* PRODUCTS LIST */}
        <section className="page-section">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-heading text-lg sm:text-xl">
                All products
              </h2>
              <p className="text-[0.7rem] text-choForest/60">
                Click edit to modify details or delete to remove from store.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <select
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                className="input-field max-w-[130px] py-1.5 text-xs"
              >
                <option value="all">All moods</option>
                {moods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="input-field max-w-[150px] py-1.5 text-xs"
              >
                <option value="all">All sizes</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="input-field max-w-[150px] py-1.5 text-xs"
              >
                <option value="all">All stock</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>
              <input
                type="text"
                placeholder="Search name, slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field max-w-xs py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            {!products.length && (
              <p className="text-xs text-choForest/60">
                No products yet. Add your first candle above.
              </p>
            )}

            {filteredProducts.map((p) => (
              <article
                key={p.id}
                className="bg-[#f7f3e6] rounded-2xl px-4 py-3 border border-black/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-14 w-14 rounded-xl object-cover border border-black/10"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-white/60 border border-dashed border-black/20 flex items-center justify-center text-[0.6rem] text-choForest/50">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="font-heading text-sm mb-0.5">
                      {p.name}
                    </p>
                    <p className="text-[0.7rem] text-choForest/60">
                      {p.mood} · {p.size}
                      {p.is_best_seller && " · Best seller"}
                    </p>
                    <p className="text-[0.7rem] text-choForest/60 mt-0.5">
                      Slug: <span className="font-mono">{p.slug}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-xs">
                  <div className="flex items-center gap-3">
                    <p className="text-[0.7rem] text-choForest/70">
                      Stock:{" "}
                      <span className="font-semibold">{p.stock}</span>
                    </p>
                    <p className="text-sm font-semibold">{p.price} THB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="btn-ghost text-[0.7rem] uppercase tracking-[0.15em]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="btn-ghost text-[0.7rem] uppercase tracking-[0.15em] text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {products.length > 0 && !filteredProducts.length && (
              <p className="text-xs text-choForest/60">
                No products match these filters.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

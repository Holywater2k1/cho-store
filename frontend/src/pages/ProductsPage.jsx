// src/pages/ProductsPage.jsx
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();

  // filters
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    const aOut = !a.stock || a.stock === 0;
    const bOut = !b.stock || b.stock === 0;
    if (aOut === bOut) return 0;
    return aOut ? 1 : -1;
  });

  const moods = Array.from(
    new Set(sortedProducts.map((p) => p.mood).filter(Boolean))
  );
  const sizes = Array.from(
    new Set(sortedProducts.map((p) => p.size).filter(Boolean))
  );

  const filteredProducts = sortedProducts.filter((p) => {
    if (moodFilter !== "all" && p.mood !== moodFilter) return false;
    if (sizeFilter !== "all" && p.size !== sizeFilter) return false;
    if (inStockOnly && (!p.stock || p.stock === 0)) return false;
    if (search) {
      const q = search.toLowerCase();
      const text = [
        p.name,
        p.description,
        p.mood,
        p.size,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const handleAddToCart = (product) => {
    if (!product || product.stock === 0) return;
    addItem(product, 1);
  };

  return (
    <main className="min-h-screen bg-choSand">
      <div className="page-shell py-10">
        <div className="page-section mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.25em] text-[0.7rem] text-choForest/60">
                Shop
              </p>
              <h1 className="font-heading text-2xl sm:text-3xl mt-2 mb-2">
                Explore the full Cho collection
              </h1>
              <p className="max-w-md text-sm sm:text-base text-choForest/80 leading-relaxed">
                Use the filters to find a candle that matches your mood and
                space — from calm mornings to slow-night playlists.
              </p>
            </div>
            <div className="text-xs sm:text-[0.8rem] text-choForest/60">
              Tip: start with{" "}
              <span className="font-semibold">one daytime</span> and{" "}
              <span className="font-semibold">one night scent.</span>
            </div>
          </div>
        </div>

        <div className="page-section">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
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

              <label className="flex items-center gap-2 text-[0.75rem] text-choForest/75">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border border-black/20"
                />
                In stock only
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by name, mood..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field max-w-xs py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <p className="text-sm text-choForest/70">
              No products match these filters. Try clearing some filters or
              searching with another word.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

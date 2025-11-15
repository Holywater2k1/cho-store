import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(data));
  }, []);

  // 🔽 sort: available products first, then out-of-stock
  const sortedProducts = [...products].sort((a, b) => {
    const aOut = !a.stock || a.stock === 0;
    const bOut = !b.stock || b.stock === 0;
    if (aOut === bOut) return 0;      // both same availability → keep original order
    return aOut ? 1 : -1;             // out-of-stock goes after in-stock
  });

  return (
    <main className="min-h-screen bg-choSand">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="uppercase tracking-[0.25em] text-[0.7rem] text-gray-500">
              SHOP
            </p>
            <h1 className="font-heading text-3xl md:text-4xl mt-2">
              All candles
            </h1>
          </div>
          <p className="text-sm text-gray-600 max-w-sm">
            Mix and match your favourite moods – from calm evenings to focused
            work sessions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {sortedProducts.map((p) => (
            <article
              key={p.id}
              className={`relative bg-[#f7f3e6] rounded-2xl p-5 shadow-sm flex flex-col transition
                ${
                  p.stock === 0
                    ? "opacity-50" // dim sold-out products
                    : "hover:-translate-y-1 hover:shadow-md"
                }`}
            >
              {/* BEST SELLER BADGE */}
              {p.is_best_seller && (
                <span className="absolute top-3 left-3 bg-amber-600 text-white text-[0.7rem] px-2 py-1 rounded-full">
                  Best seller
                </span>
              )}

              {/* OUT OF STOCK BADGE */}
              {p.stock === 0 && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  Out of stock
                </span>
              )}

              {/* PRODUCT IMAGE */}
              <div className="h-40 mb-3 rounded-xl overflow-hidden bg-choForest/10">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-choForest/15" />
                )}
              </div>

              <h2 className="font-heading text-xl mb-1">{p.name}</h2>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                {p.description}
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gray-500 mb-1">
                {p.mood} • {p.size}
              </p>

              {/* stock information */}
              {typeof p.stock === "number" && (
                <p className="text-[0.7rem] text-gray-500 mb-4">
                  {p.stock === 0 ? "Not available" : `In stock: ${p.stock}`}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between">
                <span className="font-semibold text-sm">{p.price} THB</span>

                <button
                  onClick={() => {
                    if (p.stock > 0) addItem(p, 1);
                  }}
                  disabled={p.stock === 0}
                  className={`text-xs rounded-full px-4 py-1 border transition
                    ${
                      p.stock === 0
                        ? "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "border-choForest hover:bg-choForest hover:text-white"
                    }`}
                >
                  {p.stock === 0 ? "Unavailable" : "Add to cart"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

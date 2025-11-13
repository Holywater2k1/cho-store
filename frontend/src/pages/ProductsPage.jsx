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
          {products.map((p) => (
            <article
              key={p.id}
              className="bg-[#f7f3e6] rounded-2xl p-5 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-md transition"
            >
              <div className="h-40 bg-choForest/15 mb-3 rounded-xl" />
              <h2 className="font-heading text-xl mb-1">{p.name}</h2>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                {p.description}
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gray-500 mb-4">
                {p.mood} • {p.size}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-semibold text-sm">{p.price} THB</span>
                <button
                  onClick={() => addItem(p, 1)}
                  className="text-xs border border-choForest rounded-full px-4 py-1 hover:bg-choForest hover:text-white transition"
                >
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

  const bestSellers = products.filter((p) => p.is_best_seller);

  return (
    <div className="min-h-screen bg-choSand text-choForest">
      {/* HERO */}
      <section
        id="home"
        className="relative min-h-[70vh] flex items-center justify-center text-center text-white overflow-hidden"
      >
        {/* Background image – later you can use bg-[url('/hero.jpg')] */}
        <div className="absolute inset-0 bg-choForest" />
        <div className="absolute inset-0 bg-black/35" />

        

        <div className="relative max-w-3xl px-6 pt-16 md:pt-10">
          <p className="uppercase tracking-[0.4em] text-[0.65rem] md:text-xs mb-3 text-white/70">
            IT&apos;S TIME TO
          </p>
          <h1 className="font-heading text-4xl md:text-6xl leading-tight mb-4">
            VISIT CHO
          </h1>
          <p className="text-sm md:text-base mb-8 text-gray-100 leading-relaxed">
            Scented candles crafted to turn your room into a quiet escape.
            Calm, focus and dream in every flame.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#bestsellers"
              className="inline-flex items-center justify-center rounded-full border border-white px-6 py-2 text-xs md:text-sm hover:bg-white hover:text-choForest transition"
            >
              Best sellers
            </a>
            <a
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-2 text-xs md:text-sm hover:bg-white/10 transition"
            >
              Shop all candles
            </a>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section
        id="bestsellers"
        className="bg-[#e4deca] py-16 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <p className="uppercase tracking-[0.25em] text-[0.7rem] text-gray-500">
            BEST SELLERS
          </p>
          <h2 className="font-heading text-3xl md:text-4xl mt-3 mb-3">
            Loved by the Cho community
          </h2>
          <p className="max-w-md text-sm md:text-base text-gray-700 mb-10 leading-relaxed">
            A curated selection of scents that are always the first to sell out.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {bestSellers.map((p) => (
              <article
                key={p.id}
                className="bg-[#f7f3e6] rounded-2xl overflow-hidden shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-md transition"
              >
                {/* image placeholder – replace with <img src={p.image_url} /> later */}
                <div className="h-44 bg-choForest/15" />

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-heading text-xl mb-1 leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {p.description}
                  </p>
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gray-500 mb-4">
                    {p.mood} • {p.size}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {p.price} THB
                    </span>
                    <button
                      onClick={() => addItem(p, 1)}
                      className="text-xs border border-choForest rounded-full px-4 py-1 hover:bg-choForest hover:text-white transition"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {!bestSellers.length && (
              <p className="col-span-full text-sm text-gray-500">
                No best sellers marked yet — set <code>is_best_seller = true</code>{" "}
                for some products in Supabase.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

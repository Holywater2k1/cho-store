import { useEffect, useState } from "react";
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

  // 🔽 always compute from latest products:
  //    - only is_best_seller
  //    - in-stock items first
  //    - limit to 3 cards
  const bestSellers = [...products]
    .filter((p) => p.is_best_seller)
    .sort((a, b) => {
      const aOut = !a.stock || a.stock === 0;
      const bOut = !b.stock || b.stock === 0;
      if (aOut === bOut) return 0;
      return aOut ? 1 : -1; // out-of-stock goes below in-stock
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-choSand text-choForest">
      {/* ================= HERO ================= */}
      <section
        id="home"
        className="relative min-h-[70vh] flex items-center justify-center text-center text-white overflow-hidden"
      >
        {/* Background – later you can swap to bg-[url('/hero.jpg')] */}
        <div className="absolute inset-0 bg-choForest" />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative max-w-3xl px-6 pt-8 pb-16">
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

      {/* ================= BEST SELLERS ================= */}
      <section id="bestsellers" className="bg-[#e4deca] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="uppercase tracking-[0.25em] text-[0.7rem] text-gray-500">
            BEST SELLERS
          </p>
          <h2 className="font-heading text-3xl md:text-4xl mt-3 mb-3">
            Loved by the Cho community
          </h2>
          <p className="max-w-md text-sm md:text-base text-gray-700 mb-10 leading-relaxed">
            A curated selection of scents that are always the first to sell out.
            Perfect for gifting or lighting on a slow evening at home.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {bestSellers.map((p) => (
              <article
                key={p.id}
                className={`relative bg-[#f7f3e6] rounded-2xl overflow-hidden shadow-sm flex flex-col transition
                  ${
                    p.stock === 0
                      ? "opacity-50"
                      : "hover:-translate-y-1 hover:shadow-md"
                  }`}
              >
                {/* BEST SELLER BADGE */}
                <span className="absolute top-3 left-3 bg-amber-600 text-white text-[0.7rem] px-2 py-1 rounded-full">
                  Best seller
                </span>

                {/* OUT OF STOCK BADGE */}
                {p.stock === 0 && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    Out of stock
                  </span>
                )}

                {/* PRODUCT IMAGE */}
                <div className="h-44 bg-choForest/10 overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-choForest/20 via-choClay/10 to-choSand/40" />
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-heading text-xl mb-1 leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {p.description}
                  </p>
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gray-500 mb-2">
                    {p.mood} • {p.size}
                  </p>

                  {typeof p.stock === "number" && (
                    <p className="text-[0.7rem] text-gray-500 mb-4">
                      {p.stock === 0 ? "Not available" : `In stock: ${p.stock}`}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {p.price} THB
                    </span>
                    <button
                      onClick={() => {
                        if (p.stock > 0) addItem(p, 1);
                      }}
                      disabled={p.stock === 0}
                      className={`text-xs border rounded-full px-4 py-1 transition
                        ${
                          p.stock === 0
                            ? "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "border-choForest hover:bg-choForest hover:text-white"
                        }`}
                    >
                      {p.stock === 0 ? "Unavailable" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {!bestSellers.length && (
              <p className="col-span-full text-sm text-gray-500">
                No best sellers marked yet — set{" "}
                <code>is_best_seller = true</code> for some products in
                Supabase.
              </p>
            )}
          </div>

          {/* View all products button */}
          <div className="mt-6 flex justify-end">
            <a
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-choForest px-5 py-2 text-xs md:text-sm hover:bg-choForest hover:text-white transition"
            >
              View all products
            </a>
          </div>
        </div>
      </section>

      {/* ================= MOOD CARDS ================= */}
      <section className="bg-choSand py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="uppercase tracking-[0.25em] text-[0.7rem] text-gray-500 mb-2">
              MOODS
            </p>
            <h2 className="font-heading text-3xl mb-3">
              Light for how you feel.
            </h2>
            <p className="text-sm text-gray-700">
              Whether you need a quiet reset, deep focus, or a dreamy night,
              Cho candles are blended to match the moment.
            </p>
          </div>

          <div className=" md:col-span-2 grid gap-5 md:grid-cols-3">
            <MoodCard
              title="Calm"
              tagline="Soft woods & warm tea"
              desc="Slow evenings, rainy playlists and long baths."
            />
            <MoodCard
              title="Focus"
              tagline="Green citrus & herbs"
              desc="Clean desk, study sessions and deep work."
            />
            <MoodCard
              title="Dream"
              tagline="Amber & vanilla haze"
              desc="Late-night journaling and gentle sleep."
            />
          </div>
        </div>
      </section>

      {/* ================= STORY SECTION ================= */}
      <section className="bg-choForest text-choSand py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 items-center">
          {/* Image placeholder */}
          <div className="h-72 md:h-80 rounded-3xl bg-gradient-to-br from-choSand/10 via-white/5 to-choClay/20 border border-white/10" />

          <div>
            <p className="uppercase tracking-[0.25em] text-[0.7rem] text-choSand/70 mb-2">
              IN LOVE WITH CHO
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              A small studio with a big obsession.
            </h2>
            <p className="text-sm md:text-base text-choSand/90 mb-4 leading-relaxed">
              Cho started as late-night experiments in a tiny Bangkok apartment:
              mixing wax in old pots, testing scents on friends, burning through
              notebooks of ideas.
            </p>
            <p className="text-sm md:text-base text-choSand/80 leading-relaxed mb-6">
              Every candle is still poured in small batches, with scents tested
              for balance between throw and comfort. No harsh additives, no
              overwhelming perfumes — just quiet, warm light.
            </p>
            <a
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-choSand px-6 py-2 text-xs md:text-sm hover:bg-choSand hover:text-choForest transition"
            >
              Explore the collection
            </a>
          </div>
        </div>
      </section>

      {/* ================= CRAFT / BENEFITS ================= */}
      <section className="bg-[#e4deca] py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl mb-8">
            What makes a Cho candle different?
          </h2>
          <div className="grid gap-6 md:grid-cols-3 text-sm text-gray-700">
            <Feature
              title="Clean-burning blend"
              desc="Natural wax blend with cotton wicks for a slow, even burn and less soot."
            />
            <Feature
              title="Thoughtful scent design"
              desc="Layered top, heart and base notes — cozy but never overpowering."
            />
            <Feature
              title="Made in small batches"
              desc="Poured by hand in small runs so each batch gets full attention."
            />
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-choForest text-choSand/80 py-6 px-4 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} Cho Candles. All rights reserved.</p>
          <p className="text-choSand/60">
            Made with quiet nights, lo-fi playlists and too much wax.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- small presentational components ---------- */

function MoodCard({ title, tagline, desc }) {
  return (
    <article className="bg-[#f7f3e6] rounded-2xl p-5 shadow-sm border border-black/5 hover:-translate-y-1 hover:shadow-md transition">
      <p className="uppercase tracking-[0.25em] text-[0.7rem] text-gray-500 mb-2">
        {title}
      </p>
      <h3 className="font-heading text-lg mb-1">{tagline}</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
    </article>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-[#f7f3e6] rounded-2xl p-5 border border-black/5">
      <h3 className="font-heading text-base mb-2">{title}</h3>
      <p className="text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

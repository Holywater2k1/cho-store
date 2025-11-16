// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

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

  const bestSellers = [...products]
    .filter((p) => p.is_best_seller)
    .sort((a, b) => {
      const aOut = !a.stock || a.stock === 0;
      const bOut = !b.stock || b.stock === 0;
      if (aOut === bOut) return 0;
      return aOut ? 1 : -1;
    })
    .slice(0, 3);

  const handleAddToCart = (product) => {
    if (!product || product.stock === 0) return;
    addItem(product, 1);
  };

  return (
    <main className="bg-choSand text-choForest">
      {/* ================= HERO (GREEN VERSION, MODERNIZED) ================= */}
<section className="relative overflow-hidden border-b border-black/5">
  {/* Soft green gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#0f2622] via-[#12372a] to-[#2b4c3e]" />

  {/* Decorative soft blobs */}
  <div className="absolute -left-20 top-[-3rem] h-60 w-60 rounded-full bg-emerald-300/20 blur-3xl" />
  <div className="absolute right-[-3rem] bottom-[-3rem] h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />

  <div className="relative page-shell py-16 sm:py-20">
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr),minmax(0,1fr)] items-center">
      
      {/* LEFT CONTENT */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 mb-4">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="text-[0.7rem] uppercase tracking-[0.22em] text-white/80">
            Hand-poured in small batches
          </span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.3rem] leading-tight text-white mb-4">
          Scented candles
          <span className="block text-amber-200">
            for slow, cozy evenings.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-white/85 max-w-xl leading-relaxed mb-6">
          Cho candles transform your room into a soft, warm retreat — perfect for studying, journaling, or winding down after a long day.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <a href="#bestsellers" className="btn-primary text-xs sm:text-sm">
            Shop best sellers
          </a>
          <Link to="/products" className="btn-outline text-xs sm:text-sm">
            View all scents
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 text-[0.75rem] text-white/75">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span>Clean burning, cotton wicks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
            <span>Perfect scents for small rooms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
            <span>Ships across Thailand</span>
          </div>
        </div>
      </div>

      {/* RIGHT: PHOTO CARD */}
      <div className="hidden sm:flex justify-end">
        <div className="relative w-full max-w-sm">
          {/* colorful glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-300/40 via-amber-300/30 to-teal-300/40 blur-3xl opacity-70" />

          <div className="relative rounded-[1.75rem] overflow-hidden bg-[#0a1f1a] border border-white/10 shadow-[0_26px_60px_rgba(0,0,0,0.45)]">
            <div className="aspect-[4/5] w-full">
              <img
                src="/hero-candles.jpg"
                alt="Cho candles on a cozy desk"
                className="h-full w-full object-cover"
              />
            </div>

            {/* gradient overlay text */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-5 pt-10">
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/70 mb-1">
                Featured scent
              </p>
              <h2 className="font-heading text-lg text-white mb-1">
                Cho Original
              </h2>
              <p className="text-xs text-white/80">
                A warm blend of vanilla, sandalwood and soft citrus — your daily unwind candle.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* ================= BEST SELLERS ================= */}
      <section id="bestsellers" className="page-shell pt-10 pb-12">
        <div className="page-section">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="uppercase tracking-[0.25em] text-[0.7rem] text-choForest/60">
                Best sellers
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl mt-2 mb-2">
                Loved by the Cho community
              </h2>
              <p className="max-w-md text-sm sm:text-base text-choForest/80 leading-relaxed">
                Scents that sell out first. Perfect for gifting or setting the
                mood for your next slow evening.
              </p>
            </div>
            <div className="text-xs sm:text-[0.8rem] text-choForest/60">
              Free shipping over{" "}
              <span className="font-semibold">999 THB</span>
            </div>
          </div>

          {bestSellers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {bestSellers.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  bestSeller
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-choForest/20 bg-white/70 px-4 py-6 text-sm text-choForest/75">
              We&apos;re still curating our best sellers.{" "}
              <Link to="/products" className="underline">
                View all products
              </Link>{" "}
              to explore the full collection.
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Link to="/products" className="btn-ghost text-xs sm:text-sm">
              View all products
            </Link>
          </div>
        </div>
      </section>

      {/* ================= STORY (MODERN) ================= */}
<section className="page-shell pt-10 pb-12">
  <div className="page-section relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-[#f7f1df] via-[#f9f4e8] to-[#f3e6cf] border border-black/5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
    {/* subtle top gradient line */}
    <div className="pointer-events-none absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-emerald-500/40 via-amber-500/40 to-emerald-500/20 rounded-full" />

    <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr),minmax(0,1fr)] items-start pt-6">
      {/* LEFT TEXT */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 mb-4 border border-black/5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[0.7rem] uppercase tracking-[0.25em] text-choForest/70">
            The Cho story
          </span>
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl md:text-[2rem] mb-3 text-choForest">
          Designed for small rooms, big feelings.
        </h2>

        <p className="text-sm sm:text-base text-choForest/80 leading-relaxed mb-4">
          Cho started as a way to bring a calm, cozy feeling into small city
          bedrooms. Each scent is tested at different times of day — early
          morning, late nights, rainy afternoons — to make sure it never feels
          too heavy.
        </p>
        <p className="text-sm text-choForest/75 leading-relaxed">
          We focus on warm, balanced blends that work well for studying,
          relaxing, or journaling. Nothing overpowering, just gentle background
          comfort that makes the room feel a little softer.
        </p>

        <div className="mt-5 flex flex-wrap gap-3 text-[0.75rem] text-choForest/70">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 border border-black/5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Burn-tested in small rooms</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 border border-black/5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Never too strong or heavy</span>
          </span>
        </div>
      </div>

      {/* RIGHT STORY CARDS */}
      <div className="grid gap-4">
        <StoryCard
          eyebrow="Soft, non-distracting scents"
          title="For your study desk"
          desc="Light a candle that keeps you focused while your playlist and to-do list get the spotlight."
        />
        <StoryCard
          eyebrow="Your small night routine"
          title="For winding down"
          desc="Finish your day with a quiet ritual — one match, one flame, a few deep breaths before bed."
        />
      </div>
    </div>
  </div>
</section>


      {/* ================= BENEFITS (MODERN) ================= */}
<section className="page-shell pb-16">
  <div className="page-section rounded-[2.2rem] bg-gradient-to-br from-[#faf3e5] via-[#fdf7ec] to-[#f7ebd7] border border-black/5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-choForest/60 mb-1">
          Why Cho?
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl mb-2 text-choForest">
          What makes a Cho candle different?
        </h2>
        <p className="text-sm sm:text-base text-choForest/80 max-w-xl leading-relaxed">
          Small details, tested burns, and gentle scents that feel like part of
          the room — not the whole room&apos;s personality.
        </p>
      </div>
      <div className="text-[0.75rem] text-choForest/65">
        Poured in small batches • Designed in Thailand
      </div>
    </div>

    <div className="grid gap-6 md:grid-cols-3 text-sm text-choForest/80">
      <Feature
        icon="🕯️"
        title="Clean-burning blend"
        desc="Natural wax blend with cotton wicks for a slow, even burn and less soot — better for you and your walls."
      />
      <Feature
        icon="🏡"
        title="Made for small spaces"
        desc="Balanced so they feel present, but never heavy — perfect for bedrooms, desks, and studio apartments."
      />
      <Feature
        icon="🎁"
        title="Easy to gift"
        desc="Minimal design, calm colors, and versatile scents make Cho a safe choice for friends, family, or yourself."
      />
    </div>
  </div>
</section>
    </main>
  );
}

function StoryCard({ eyebrow, title, desc }) {
  return (
    <article className="relative overflow-hidden rounded-2xl bg-[#fbf7ee] border border-black/5 shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
      {/* accent stripe */}
      <div className="absolute inset-y-3 left-3 w-[3px] rounded-full bg-gradient-to-b from-emerald-500/70 via-amber-500/60 to-emerald-500/60" />
      {/* subtle dot pattern */}
      <div className="pointer-events-none absolute right-3 top-3 h-16 w-16 rounded-full border border-dashed border-emerald-500/15" />

      <div className="pl-6 pr-5 py-4">
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-choForest/55 mb-1.5">
          {eyebrow}
        </p>
        <h3 className="font-heading text-base sm:text-lg mb-1 text-choForest">
          {title}
        </h3>
        <p className="text-sm text-choForest/80 leading-relaxed">{desc}</p>
      </div>
    </article>
  );
}


function Feature({ icon, title, desc }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#fbf7ee] border border-black/5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition-transform duration-200 hover:-translate-y-1">
      {/* top accent bar */}
      <div className="absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-emerald-500/60 via-amber-500/50 to-emerald-500/40 opacity-80" />

      <div className="relative p-5 pt-6">
        <div className="flex items-center gap-2 mb-2">
          {icon && (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 border border-black/5 text-base">
              {icon}
            </span>
          )}
          <h3 className="font-heading text-base text-choForest">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-choForest/80">{desc}</p>
      </div>
    </div>
  );
}


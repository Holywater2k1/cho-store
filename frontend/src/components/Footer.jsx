// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 bg-[#f4eec7]">
      <div className="page-shell py-8 sm:py-9">
        <div className="page-section flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand + tagline */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-[0.75rem] font-semibold text-white">
                Cho
              </div>
              <div className="leading-tight">
                <p className="text-[0.75rem] uppercase tracking-[0.25em] text-choForest/70">
                  Cho Candle
                </p>
                <p className="text-[0.7rem] text-choForest/60">
                  Hand-poured scents
                </p>
              </div>
            </div>
            <p className="text-sm text-choForest/80 leading-relaxed">
              Small-batch candles for slow evenings, quiet mornings, and those
              playlists you only play when the lights are low.
            </p>
          </div>

          {/* Middle: navigation columns */}
          <div className="flex flex-wrap gap-8 text-xs sm:text-[0.8rem] text-choForest/80">
            <div>
              <p className="font-semibold text-choForest text-[0.8rem] mb-2">
                Shop
              </p>
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/products"
                  className="hover:underline underline-offset-2"
                >
                  All candles
                </Link>
                <Link to="/cart" className="hover:underline underline-offset-2">
                  Cart
                </Link>
                <Link
                  to="/orders"
                  className="hover:underline underline-offset-2"
                >
                  Orders
                </Link>
              </div>
            </div>

            <div>
              <p className="font-semibold text-choForest text-[0.8rem] mb-2">
                Account
              </p>
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/auth"
                  className="hover:underline underline-offset-2"
                >
                  Login &amp; sign up
                </Link>
                <Link
                  to="/profile"
                  className="hover:underline underline-offset-2"
                >
                  Profile
                </Link>
              </div>
            </div>

            <div>
              <p className="font-semibold text-choForest text-[0.8rem] mb-2">
                Info
              </p>
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/notifications"
                  className="hover:underline underline-offset-2"
                >
                  Updates &amp; offers
                </Link>
                <span className="text-choForest/60">
                  Email: hello@chocandle.test
                </span>
              </div>
            </div>
          </div>

          {/* Right: small “newsletter” style note */}
          <div className="max-w-xs text-[0.75rem] text-choForest/75 space-y-3">
            <p className="font-semibold text-choForest text-[0.8rem]">
              Stay in a slow mood
            </p>
            <p>
              Get updates when new scents drop or when we restock limited
              batches.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-[0.75rem] focus:outline-none focus:ring-2 focus:ring-choClay/40"
              />
              <button
                type="button"
                className="rounded-full bg-choForest text-white px-3 py-2 text-[0.75rem]"
              >
                Join
              </button>
            </div>
            <p className="text-[0.7rem] text-choForest/60">
              No spam, just the occasional cozy update.
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[0.7rem] text-choForest/60">
          <p>&copy; {year} Cho Candle. All rights reserved.</p>
          <div className="flex gap-4">
            <button
              type="button"
              className="hover:underline underline-offset-2"
            >
              Terms
            </button>
            <button
              type="button"
              className="hover:underline underline-offset-2"
            >
              Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

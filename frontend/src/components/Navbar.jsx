// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { useCart } from "../context/CartContext";
import { useNotificationsSummary } from "../hooks/useNotificationsSummary";
import { useOrdersSummary } from "../hooks/useOrdersSummary";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { profile } = useUserProfile();

  const { items } = useCart();
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const unreadNotifications = useNotificationsSummary();
  const activeOrdersCount = useOrdersSummary();

  // 👇 Adjust this to match your real admin logic
  // e.g. based on profile.role, profile.is_admin, or user.email
  const isAdmin =
    profile?.role === "admin" ||
    profile?.is_admin === true ||
    user?.email === "admin@example.com"; // <-- change this

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinkBase =
    "relative rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors";
  const navLinkActive = "bg-choForest text-choSand shadow-sm";
  const navLinkIdle =
    "text-choForest/70 hover:text-choForest hover:bg-choForest/5";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-choSand/80 border-b border-black/5">
      <nav className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Left: Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group"
        >
          <div className="h-9 w-9 rounded-2xl bg-choForest text-choSand flex items-center justify-center text-sm font-semibold shadow-md group-hover:scale-95 transition-transform">
            Cho
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="font-heading text-sm tracking-wide">
              Cho Candle
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-choForest/60">
              hand-poured scents
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-2">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
                }
              >
                Shop
              </NavLink>
            </li>

            {user && (
              <>
                <li>
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
                    }
                  >
                    Orders
                    {activeOrdersCount > 0 && (
                      <span className="ml-1 inline-flex h-5 min-w-[1.4rem] items-center justify-center rounded-full bg-choClay text-[0.6rem] text-choSand">
                        {activeOrdersCount}
                      </span>
                    )}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/notifications"
                    className={({ isActive }) =>
                      `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
                    }
                  >
                    Alerts
                    {unreadNotifications > 0 && (
                      <span className="ml-1 inline-flex h-5 min-w-[1.4rem] items-center justify-center rounded-full bg-choClay text-[0.6rem] text-choSand">
                        {unreadNotifications}
                      </span>
                    )}
                  </NavLink>
                </li>
              </>
            )}

            {/* ADMIN LINKS (desktop) */}
            {user && isAdmin && (
              <li className="ml-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-choForest/5 border border-choForest/15 px-2 py-1">
                  <span className="text-[0.65rem] uppercase tracking-[0.18em] text-choForest/60">
                    Admin
                  </span>
                  <div className="flex items-center gap-1">
                    <NavLink
                      to="/admin/products"
                      className={({ isActive }) =>
                        `px-2 py-0.5 rounded-full text-[0.7rem] ${
                          isActive
                            ? "bg-choForest text-choSand"
                            : "text-choForest/70 hover:bg-choForest/10"
                        }`
                      }
                    >
                      Products
                    </NavLink>
                    <NavLink
                      to="/admin/orders"
                      className={({ isActive }) =>
                        `px-2 py-0.5 rounded-full text-[0.7rem] ${
                          isActive
                            ? "bg-choForest text-choSand"
                            : "text-choForest/70 hover:bg-choForest/10"
                        }`
                      }
                    >
                      Orders
                    </NavLink>
                    <NavLink
                      to="/admin/notifications"
                      className={({ isActive }) =>
                        `px-2 py-0.5 rounded-full text-[0.7rem] ${
                          isActive
                            ? "bg-choForest text-choSand"
                            : "text-choForest/70 hover:bg-choForest/10"
                        }`
                      }
                    >
                      Notify
                    </NavLink>
                  </div>
                </div>
              </li>
            )}
          </ul>

          {/* Right side: cart + auth */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative inline-flex items-center justify-center rounded-full px-2 py-1 text-choForest/80 hover:bg-choForest/5"
            >
              <span className="sr-only">Open cart</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 5h2l1.2 10.2A1.5 1.5 0 0 0 8.7 16h8.6a1.5 1.5 0 0 0 1.49-1.3L20 8H7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="19" r="1" fill="currentColor" />
                <circle cx="17" cy="19" r="1" fill="currentColor" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[1.1rem] rounded-full bg-choClay text-[0.6rem] text-choSand flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {loading ? (
              <span className="text-xs text-choForest/60">Checking...</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/profile")}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/10 px-3 py-1.5 text-xs"
                >
                  <span className="h-7 w-7 rounded-full bg-choForest/10 flex items-center justify-center text-[0.65rem] font-semibold">
                    {profile?.username?.[0]?.toUpperCase() ||
                      profile?.display_name?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase() ||
                      "U"}
                  </span>
                  <span className="max-w-[7rem] truncate text-choForest/80">
                    {profile?.username ||
                      profile?.display_name ||
                      user.email}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-choForest/20 text-xs sm:text-sm text-choForest/80 hover:bg-choForest/5"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-choForest text-choSand hover:bg-black transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => navigate("/cart")}
            className="relative inline-flex items-center justify-center rounded-full px-2 py-1 text-choForest/80 hover:bg-choForest/5"
          >
            <span className="sr-only">Open cart</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 5h2l1.2 10.2A1.5 1.5 0 0 0 8.7 16h8.6a1.5 1.5 0 0 0 1.49-1.3L20 8H7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="19" r="1" fill="currentColor" />
              <circle cx="17" cy="19" r="1" fill="currentColor" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[1.1rem] rounded-full bg-choClay text-[0.6rem] text-choSand flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full px-2 py-1 text-choForest/80 hover:bg-choForest/5"
          >
            <span className="sr-only">Toggle menu</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              {open ? (
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h12"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-black/5 bg-choSand/95 backdrop-blur-md">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-4 space-y-4">
            <ul className="flex flex-col gap-1">
              <li>
                <NavLink
                  to="/"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${navLinkBase} block w-full ${
                      isActive ? navLinkActive : navLinkIdle
                    }`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/products"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${navLinkBase} block w-full ${
                      isActive ? navLinkActive : navLinkIdle
                    }`
                  }
                >
                  Shop
                </NavLink>
              </li>

              {user && (
                <>
                  <li>
                    <NavLink
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `${navLinkBase} block w-full ${
                          isActive ? navLinkActive : navLinkIdle
                        }`
                      }
                    >
                      Orders
                      {activeOrdersCount > 0 && (
                        <span className="ml-2 inline-flex h-5 min-w-[1.4rem] items-center justify-center rounded-full bg-choClay text-[0.65rem] text-choSand">
                          {activeOrdersCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/notifications"
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `${navLinkBase} block w-full ${
                          isActive ? navLinkActive : navLinkIdle
                        }`
                      }
                    >
                      Alerts
                      {unreadNotifications > 0 && (
                        <span className="ml-2 inline-flex h-5 min-w-[1.4rem] items-center justify-center rounded-full bg-choClay text-[0.65rem] text-choSand">
                          {unreadNotifications}
                        </span>
                      )}
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            {/* ADMIN (mobile) */}
            {user && isAdmin && (
              <div className="border-t border-choForest/10 pt-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-choForest/60 mb-1">
                  Admin
                </p>
                <ul className="flex flex-col gap-1">
                  <li>
                    <NavLink
                      to="/admin/products"
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `${navLinkBase} block w-full ${
                          isActive ? navLinkActive : navLinkIdle
                        }`
                      }
                    >
                      Manage products
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/orders"
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `${navLinkBase} block w-full ${
                          isActive ? navLinkActive : navLinkIdle
                        }`
                      }
                    >
                      Manage orders
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/notifications"
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `${navLinkBase} block w-full ${
                          isActive ? navLinkActive : navLinkIdle
                        }`
                      }
                    >
                      Send notifications
                    </NavLink>
                  </li>
                </ul>
              </div>
            )}

            {/* Auth controls (mobile) */}
            <div className="border-t border-choForest/10 pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full inline-flex items-center justify-between rounded-full bg-white/80 border border-black/10 px-3 py-2 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-choForest/10 flex items-center justify-center text-[0.65rem] font-semibold">
                        {profile?.username?.[0]?.toUpperCase() ||
                          profile?.display_name?.[0]?.toUpperCase() ||
                          user.email?.[0]?.toUpperCase() ||
                          "U"}
                      </span>
                      <span className="max-w-[9rem] truncate text-choForest/80">
                        {profile?.username ||
                          profile?.display_name ||
                          user.email}
                      </span>
                    </span>
                    <span className="text-[0.7rem] text-choForest/60">
                      View profile
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      setOpen(false);
                      await handleLogout();
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-medium bg-choForest text-choSand hover:bg-black transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/auth");
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-medium bg-choForest text-choSand hover:bg-black transition-colors"
                >
                  Login / Sign up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

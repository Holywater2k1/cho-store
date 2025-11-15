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

  // counts
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotiCount = useNotificationsSummary();
  const activeOrderCount = useOrdersSummary();

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  const goProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const navLinkBase =
    "inline-flex items-center gap-1 px-2 py-1 rounded-full transition-colors";

  const navLinkClass = ({ isActive }) =>
    `${navLinkBase} ${
      isActive
        ? "bg-choForest text-choSand"
        : "text-choForest/90 hover:text-choForest hover:bg-choForest/5"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-30">
      <nav className="max-w-6xl mx-auto px-4 py-3 text-[0.75rem] md:text-sm bg-choSand/80 backdrop-blur">
        {/* wrapper so mobile = column (logo centered), md+ = row (logo left, links right) */}
        <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-heading text-lg tracking-[0.25em] text-choForest text-center md:text-left"
          >
            CHO
          </Link>

          {/* Main links – allow wrapping on small screens */}
          <ul className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-choForest/90 relative md:justify-end">
            <li>
              <NavLink to="/" className={navLinkClass} end>
                Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/products" className={navLinkClass}>
                Shop
              </NavLink>
            </li>

            {/* Cart with badge */}
            <li className="relative">
              <NavLink to="/cart" className={navLinkClass}>
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-choSand text-choForest text-[0.6rem]">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            </li>

            {/* Orders with badge = active orders only */}
            <li className="relative">
              <NavLink to="/orders" className={navLinkClass}>
                <span>Orders</span>
                {activeOrderCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-choSand text-choForest text-[0.6rem]">
                    {activeOrderCount}
                  </span>
                )}
              </NavLink>
            </li>

            {/* Notifications with bell icon + unread badge */}
            <li className="relative">
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `inline-flex items-center ${
                    isActive ? "text-choForest" : "text-choForest/80"
                  }`
                }
              >
                <span className="relative inline-flex items-center justify-center h-8 w-8 rounded-full border border-choForest/25 bg-white/70 hover:bg-white transition">
                  {/* Bell icon (SVG) */}
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>

                  {unreadNotiCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-choForest text-white text-[0.55rem]">
                      {unreadNotiCount}
                    </span>
                  )}

                  <span className="sr-only">Notifications</span>
                </span>
              </NavLink>
            </li>

            {/* Profile / Login area */}
            {!loading &&
              (user ? (
                <li className="relative">
                  <button
                    onClick={() => setOpen((o) => !o)}
                    className="flex items-center gap-2 px-3 py-1 rounded-full border border-choForest/20 bg-white/60 hover:bg-white transition"
                  >
                    <span className="h-6 w-6 rounded-full bg-choForest text-white flex items-center justify-center text-[0.6rem]">
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </span>
                    <span className="hidden sm:inline text-[0.7rem] uppercase tracking-[0.18em]">
                      Profile
                    </span>
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-black/5 overflow-hidden">
                      <div className="px-3 py-2 border-b border-black/5">
                        <p className="text-[0.6rem] text-gray-500 uppercase tracking-[0.18em] mb-1">
                          Logged in
                        </p>
                        <p className="text-xs text-gray-800 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* ADMIN BUTTONS */}
                      {profile?.role === "admin" && (
                        <>
                          <button
                            onClick={() => {
                              setOpen(false);
                              navigate("/admin/products");
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-choSand/60"
                          >
                            Admin · Products
                          </button>
                          <button
                            onClick={() => {
                              setOpen(false);
                              navigate("/admin/orders");
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-choSand/60"
                          >
                            Admin · Orders
                          </button>
                          <button
                            onClick={() => {
                              setOpen(false);
                              navigate("/admin/notifications");
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-choSand/60"
                          >
                            Admin · Notifications
                          </button>
                        </>
                      )}

                      <button
                        onClick={goProfile}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-choSand/60"
                      >
                        View profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              ) : (
                <li>
                  <NavLink
                    to="/auth"
                    className={({ isActive }) =>
                      `px-2 py-1 rounded-full transition-colors ${
                        isActive
                          ? "bg-choForest text-choSand"
                          : "text-choForest/90 hover:text-choForest hover:bg-choForest/5"
                      }`
                    }
                  >
                    Login
                  </NavLink>
                </li>
              ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useUserProfile } from "../hooks/useUserProfile";


export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { profile } = useUserProfile();


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

  return (
    <header className="fixed top-0 left-0 w-full z-30">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4 text-xs md:text-sm bg-choSand/80 backdrop-blur">
        <Link
          to="/"
          className="font-heading text-lg tracking-[0.25em] text-choForest"
        >
          CHO
        </Link>

        <ul className="flex items-center gap-4 md:gap-6 text-choForest/90 relative">

          <li>
            <a href="/" className="hover:text-choForest">
              Home
            </a>
          </li>

          
          <li>
            <Link to="/products" className="hover:text-choForest">
              Shop
            </Link>
          </li>
          <li>
            <Link to="/cart" className="hover:text-choForest">
              Cart
            </Link>
          </li>
          <li>
  <Link to="/notifications" className="hover:text-choForest">
    Notifications
  </Link>
</li>


          {/* Profile / Login area */}
          {!loading && (
            user ? (
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

    {/* ADMIN BUTTON */}
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
                <Link to="/auth" className="hover:text-choForest">
                  Login
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </header>
  );
}

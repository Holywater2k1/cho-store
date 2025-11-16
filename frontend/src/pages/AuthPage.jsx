// src/pages/AuthPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (isLogin) {
        // normal login -> go back to previous page or home
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        // SIGN UP -> force user to profile first
        await signup(email, password);

        navigate("/profile", {
          replace: true,
          state: {
            from,
            justSignedUp: true, // we’ll use this in ProfilePage
          },
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-choSand to-[#f7f3e6]">
      <div className="page-shell flex items-center justify-center">
        <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-[1.2fr,1fr] items-center">
          {/* Left: brand story */}
          <section className="hidden lg:block glass-card px-8 py-10">
            <div className="pill mb-4">Welcome to Cho</div>
            <h1 className="text-3xl leading-tight mb-4">
              Sign in to your
              <span className="block text-choClay">
                calm and cozy ritual.
              </span>
            </h1>
            <p className="text-sm text-choForest/80 mb-6 max-w-md">
              Track your orders, keep your favorite scents close, and get
              notified when limited batches drop. One login for all your
              candle moments.
            </p>
            <ul className="space-y-2 text-sm text-choForest/75">
              <li>• Save your shipping details for faster checkout</li>
              <li>• See active orders and their status in one place</li>
              <li>• Get early access to small-batch collections</li>
            </ul>
          </section>

          {/* Right: form */}
          <section className="glass-card px-6 sm:px-8 py-7 sm:py-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-choForest/60 mb-1">
                  {isLogin ? "Welcome back" : "Create account"}
                </p>
                <h2 className="text-xl font-heading">
                  {isLogin
                    ? "Log in to your Cho account"
                    : "Join the Cho circle"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMode(isLogin ? "signup" : "login")}
                className="btn-ghost text-[0.7rem]"
              >
                {isLogin ? "Need an account?" : "Already a member?"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-[0.8rem] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full mt-2"
              >
                {busy
                  ? isLogin
                    ? "Logging you in..."
                    : "Creating your account..."
                  : isLogin
                  ? "Log in"
                  : "Sign up"}
              </button>
            </form>

            <p className="mt-5 text-[0.75rem] text-choForest/60 text-center">
              By continuing, you agree to receive emails about your orders and
              Cho updates. No spam, just candle magic.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

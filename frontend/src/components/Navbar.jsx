import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-30">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4 text-xs md:text-sm bg-choSand/95 backdrop-blur">
        <Link
          to="/"
          className="font-heading text-lg tracking-[0.25em] text-choForest"
        >
          CHO
        </Link>
        <ul className="flex items-center gap-4 md:gap-6 text-choForest/90">
          <li><a href="/#bestsellers" className="hover:text-choForest">Best seller</a></li>
          <li><Link to="/products" className="hover:text-choForest">Shop</Link></li>
          <li><Link to="/cart" className="hover:text-choForest">Cart</Link></li>
          <li><Link to="/auth" className="hover:text-choForest">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
}

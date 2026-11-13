import { Link, NavLink } from "react-router-dom";
import { money } from "../lib/format.js";
import { useCart } from "../state/CartContext.jsx";

export default function Header() {
  const { selection, total } = useCart();
  const count = selection ? selection.seats.length : 0;

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link to="/" className="wordmark" aria-label="Ticketek home">
          <span className="wordmark-mark" aria-hidden="true" />
          TICKETEK
        </Link>

        <nav className="header-nav" aria-label="Main">
          <NavLink to="/" end className="header-link">
            Events
          </NavLink>
          {count > 0 ? (
            <Link to="/checkout" className="header-cart">
              <span className="header-cart-count">
                {count} {count === 1 ? "seat" : "seats"}
              </span>
              <strong>{money(total)}</strong>
            </Link>
          ) : (
            <span className="header-cart is-empty">No seats selected</span>
          )}
        </nav>
      </div>
    </header>
  );
}

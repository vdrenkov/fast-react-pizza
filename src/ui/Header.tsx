import { Link, NavLink } from "react-router";

import SearchOrder from "../features/order/SearchOrder";

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Fast React Pizza home">
        <span className="brand-mark" aria-hidden="true">
          F<span>↗</span>
        </span>
        <span>
          FAST REACT
          <br />
          <strong>PIZZA CO.</strong>
        </span>
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/menu">Menu</NavLink>
        <NavLink to="/cart">Your cart</NavLink>
      </nav>
      <SearchOrder />
    </header>
  );
}

import { Link } from "react-router";

import { useAppSelector } from "../../hooks";
import { formatCurrency } from "../../utils/helpers";
import { getTotalCartPrice, getTotalCartQuantity } from "./cartSlice";

export default function CartOverview() {
  const quantity = useAppSelector(getTotalCartQuantity);
  const price = useAppSelector(getTotalCartPrice);

  if (!quantity) {
    return null;
  }

  return (
    <aside className="cart-bar" aria-label="Cart summary">
      <p role="status">
        <strong>
          {quantity} {quantity === 1 ? "pizza" : "pizzas"}
        </strong>
        <span>{formatCurrency(price)}</span>
      </p>
      <Link to="/cart">
        Open cart <span aria-hidden="true">↗</span>
      </Link>
    </aside>
  );
}

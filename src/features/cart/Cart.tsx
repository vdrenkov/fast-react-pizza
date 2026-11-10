import { useAppDispatch, useAppSelector } from "../../hooks";
import Button from "../../ui/Button";
import LinkButton from "../../ui/LinkButton";
import { formatCurrency } from "../../utils/helpers";
import { getUsername } from "../user/userSlice";
import CartItem from "./CartItem";
import { clearCart, getCart, getTotalCartPrice } from "./cartSlice";
import EmptyCart from "./EmptyCart";

export default function Cart() {
  const dispatch = useAppDispatch();
  const username = useAppSelector(getUsername);
  const cart = useAppSelector(getCart);
  const total = useAppSelector(getTotalCartPrice);

  if (!cart.length) {
    return <EmptyCart />;
  }

  return (
    <section className="page-section cart-page">
      <LinkButton to="/menu">← Back to menu</LinkButton>
      <p className="eyebrow">Looking delicious</p>
      <h1>Your cart{username ? `, ${username}` : ""}.</h1>
      <ul className="cart-items">
        {cart.map((item) => (
          <CartItem item={item} key={item.pizzaId} />
        ))}
      </ul>
      <div className="checkout-total">
        <span>Subtotal</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
      <div className="button-row">
        <Button to="/order/new" type="primary">
          Continue to checkout ↗
        </Button>
        <Button type="secondary" onClick={() => dispatch(clearCart())}>
          Clear cart
        </Button>
      </div>
    </section>
  );
}

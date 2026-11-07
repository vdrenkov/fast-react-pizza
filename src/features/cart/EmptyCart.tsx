import Button from "../../ui/Button";

export default function EmptyCart() {
  return (
    <section className="empty-state">
      <span className="empty-symbol" aria-hidden="true">
        ＋
      </span>
      <p className="eyebrow">Room for something good</p>
      <h1>Your cart is empty.</h1>
      <p>Let’s find your next favourite pizza.</p>
      <Button to="/menu" type="primary">
        Explore the menu ↗
      </Button>
    </section>
  );
}

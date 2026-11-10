import { formatCurrency } from "../../utils/helpers";

import type { CartItem } from "../../types";

export default function OrderItem({ item }: { item: CartItem }) {
  return (
    <li>
      <p>
        <strong>{item.quantity} ×</strong> {item.name}
      </p>
      <strong>{formatCurrency(item.totalPrice)}</strong>
    </li>
  );
}

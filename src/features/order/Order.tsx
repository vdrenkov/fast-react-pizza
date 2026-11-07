import { useEffect, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";

import { getOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import {
  calcMinutesLeft,
  formatCurrency,
  formatDate,
} from "../../utils/helpers";
import OrderItem from "./OrderItem";
import UpdateOrder from "./UpdateOrder";

import type { LoaderFunctionArgs } from "react-router";

export default function Order() {
  const order = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [now, setNow] = useState(Date.now);
  const deliveryIn = Math.ceil(
    (new Date(order.estimatedDelivery).getTime() - now) / 60_000,
  );
  const delivered = order.status === "delivered";

  useEffect(() => {
    const interval = globalThis.setInterval(() => setNow(Date.now()), 30_000);
    return () => globalThis.clearInterval(interval);
  }, []);

  return (
    <section className="page-section order-page">
      <p className="eyebrow">Fresh from our kitchen</p>
      <div className="section-heading">
        <h1>Order #{order.id}</h1>
        <div className="button-row">
          {order.priority && (
            <span className="badge badge--priority">Priority</span>
          )}
          <span className="badge">{order.status}</span>
        </div>
      </div>
      <div className="delivery-card">
        <span className="eyebrow">Estimated delivery</span>
        <h2>
          {delivered
            ? "Enjoy every slice."
            : deliveryIn > 0
              ? `About ${deliveryIn} minutes to go.`
              : "Your order should arrive soon."}
        </h2>
        <p>{formatDate(order.estimatedDelivery)} · Estimates may change.</p>
        <Button
          type="secondary"
          disabled={revalidator.state !== "idle"}
          onClick={() => void revalidator.revalidate()}
        >
          {revalidator.state === "idle" ? "Refresh status" : "Refreshing…"}
        </Button>
      </div>
      <ul className="order-items">
        {order.cart.map((item) => (
          <OrderItem key={item.pizzaId} item={item} />
        ))}
      </ul>
      <div className="order-summary">
        <p>
          <span>Pizzas</span>
          <span>{formatCurrency(order.orderPrice)}</span>
        </p>
        {order.priority && (
          <p>
            <span>Priority</span>
            <span>{formatCurrency(order.priorityPrice)}</span>
          </p>
        )}
        <p className="summary-total">
          <span>Total on delivery</span>
          <span>{formatCurrency(order.orderPrice + order.priorityPrice)}</span>
        </p>
      </div>
      {!order.priority &&
        !delivered &&
        calcMinutesLeft(order.estimatedDelivery) > 0 && (
          <UpdateOrder orderPrice={order.orderPrice} />
        )}
      <p className="field-hint">
        Portfolio demo · No payment or delivery. Keep your order number to look
        it up later.
      </p>
    </section>
  );
}

export async function loader({
  params,
  request,
}: Pick<LoaderFunctionArgs, "params" | "request">) {
  if (!params.id) {
    throw new Response("Order number missing", { status: 400 });
  }

  return getOrder(params.id, request.signal);
}

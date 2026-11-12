import { useFetcher } from "react-router";

import { updateOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { calcPriorityPrice, formatCurrency } from "../../utils/helpers";

import type { ActionFunctionArgs } from "react-router";

export default function UpdateOrder({ orderPrice }: { orderPrice: number }) {
  const fetcher = useFetcher<typeof action>();
  const pending = fetcher.state !== "idle";

  return (
    <fetcher.Form method="patch" className="priority-update">
      <p>
        Skip the queue for an extra{" "}
        {formatCurrency(calcPriorityPrice(orderPrice))}.
      </p>
      <Button type="primary" submit disabled={pending}>
        {pending ? "Updating…" : "Make priority"}
      </Button>
      {fetcher.data?.error && (
        <p role="alert" className="field-error">
          {fetcher.data.error}
        </p>
      )}
    </fetcher.Form>
  );
}

export async function action({ params }: Pick<ActionFunctionArgs, "params">) {
  if (!params.id) {
    return { error: "Order number missing." };
  }

  try {
    await updateOrder(params.id, { priority: true });
    return null;
  } catch (exception) {
    return {
      error:
        exception instanceof Error
          ? exception.message
          : "We couldn’t update your order. Please try again.",
    };
  }
}

export function calcPriorityPrice(orderPrice: number) {
  return Math.round(orderPrice * 0.2);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function calcMinutesLeft(dateStr: string, now = Date.now()) {
  const deliveryTime = new Date(dateStr).getTime();
  return Math.ceil((deliveryTime - now) / 60000);
}

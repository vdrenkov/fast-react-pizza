import { useState } from "react";
import { useNavigate } from "react-router";

import type { SubmitEvent } from "react";

export default function SearchOrder() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const orderId = query.trim();

    if (!orderId) {
      return;
    }

    void navigate(`/order/${encodeURIComponent(orderId)}`);
    setQuery("");
  }

  return (
    <form onSubmit={handleSubmit} className="order-search" role="search">
      <label htmlFor="order-search" className="sr-only">
        Order number
      </label>
      <input
        id="order-search"
        name="order"
        placeholder="Search order #"
        maxLength={64}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" aria-label="Find order">
        ↗
      </button>
    </form>
  );
}

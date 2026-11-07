import { isRouteErrorResponse, useRouteError } from "react-router";

import Button from "./Button";

export default function RouteError() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  const message =
    error instanceof Error
      ? error.message
      : "Please check the address or try again.";

  return (
    <section className="empty-state" role="alert">
      <p className="eyebrow">
        {missing ? "Page not found" : "A little interruption"}
      </p>
      <h1>
        {missing ? "This page is off the menu." : "We couldn’t load that."}
      </h1>
      <p>{message}</p>
      <div className="button-row">
        <Button type="primary" onClick={() => globalThis.location.reload()}>
          Try again
        </Button>
        <Button type="secondary" to="/menu">
          Back to menu
        </Button>
      </div>
    </section>
  );
}

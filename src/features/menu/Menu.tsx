import { useLoaderData } from "react-router";

import { getMenu } from "../../services/apiRestaurant";
import MenuItem from "./MenuItem";

import type { LoaderFunctionArgs } from "react-router";

export default function Menu() {
  const menu = useLoaderData<typeof loader>();
  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Something for every craving</p>
          <h1>The pizza menu.</h1>
        </div>
        <p>{menu.length} recipes. One delicious decision.</p>
      </div>
      {menu.length === 0 && (
        <p className="empty-state">
          The menu is empty right now. Please come back soon.
        </p>
      )}
      <ul className="menu-grid">
        {menu.map((pizza) => (
          <MenuItem pizza={pizza} key={pizza.id} />
        ))}
      </ul>
    </section>
  );
}

export async function loader({ request }: Pick<LoaderFunctionArgs, "request">) {
  return getMenu(request.signal);
}

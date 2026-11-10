import Cart from "./features/cart/Cart";
import Menu, { loader as menuLoader } from "./features/menu/Menu";
import CreateOrder, {
  action as createOrderAction,
} from "./features/order/CreateOrder";
import Order, { loader as orderLoader } from "./features/order/Order";
import { action as updateOrderAction } from "./features/order/UpdateOrder";
import AppLayout from "./ui/AppLayout";
import Error from "./ui/Error";
import Home from "./ui/Home";
import Loader from "./ui/Loader";

import type { RouteObject } from "react-router";

export const routes: RouteObject[] = [
  {
    Component: AppLayout,
    ErrorBoundary: Error,
    HydrateFallback: Loader,
    children: [
      {
        path: "*",
        loader: () => {
          throw new Response("Page not found", { status: 404 });
        },
        ErrorBoundary: Error,
      },
      {
        index: true,
        Component: Home,
      },
      {
        path: "/menu",
        Component: Menu,
        loader: menuLoader,
        ErrorBoundary: Error,
      },
      {
        path: "/cart",
        Component: Cart,
      },
      {
        path: "/order/new",
        Component: CreateOrder,
        action: createOrderAction,
      },
      {
        path: "/order/:id",
        Component: Order,
        loader: orderLoader,
        ErrorBoundary: Error,
        action: updateOrderAction,
      },
    ],
  },
];

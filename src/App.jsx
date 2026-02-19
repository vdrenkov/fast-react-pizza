import { createBrowserRouter, RouterProvider } from "react-router";

import Home from "./ui/Home";
import Error from "./ui/Error";
import AppLayout from "./ui/AppLayout";
import Menu, { loader as menuLoader } from "./features/menu/Menu";
import Cart from "./features/cart/Cart";
import Order, { loader as orderLoader } from "./features/order/Order";
import CreateOrder, {
  action as createOrderAction,
} from "./features/order/CreateOrder";
import { action as updateOrderAction } from "./features/order/UpdateOrder";

const router = createBrowserRouter([
  {
    Component: AppLayout,
    ErrorBoundary: Error,
    children: [
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
]);

export default function App() {
  return <RouterProvider router={router} />;
}


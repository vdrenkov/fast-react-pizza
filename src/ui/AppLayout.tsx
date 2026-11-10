import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigation } from "react-router";

import CartOverview from "../features/cart/CartOverview";
import Header from "./Header";
import Loader from "./Loader";

export default function AppLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      mainRef.current?.focus();
      globalThis.scrollTo({ top: 0, behavior: "instant" });
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="announcement">A little dough. A lot of happiness.</div>
      <Header />
      {navigation.state === "loading" && <Loader />}
      <main ref={mainRef} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>Fast React Pizza Co.</span>
        <span>
          A portfolio demo by Valentin Drenkov · Inspired by Jonas Schmedtmann’s
          React course.
        </span>
      </footer>
      <CartOverview />
    </div>
  );
}

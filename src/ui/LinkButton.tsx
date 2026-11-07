import { Link } from "react-router";

import type { ReactNode } from "react";

export default function LinkButton({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) {
  return (
    <Link to={to} className="text-link">
      {children}
    </Link>
  );
}

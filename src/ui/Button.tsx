import { Link } from "react-router";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
  type: "primary" | "secondary" | "small" | "round";
  to?: string;
  submit?: boolean;
};

export default function Button({
  children,
  type,
  to,
  submit = false,
  className = "",
  ...props
}: ButtonProps) {
  const styles = `button button--${type} ${className}`;

  if (to) {
    return (
      <Link to={to} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} type={submit ? "submit" : "button"} className={styles}>
      {children}
    </button>
  );
}

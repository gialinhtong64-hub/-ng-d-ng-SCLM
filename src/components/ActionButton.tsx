import React from "react";
import { tokens } from "../theme/tokens";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  ...props
}) => {
  const base = "font-semibold rounded-[var(--radius-button)] transition-all focus:outline-none focus:ring-2 flex items-center justify-center";
  const sizeClass =
    size === "sm"
      ? "px-3 py-1.5 text-[var(--font-sm)]"
      : size === "lg"
      ? "px-6 py-3 text-[var(--font-lg)]"
      : "px-4 py-2 text-[var(--font-md)]";
  let colorClass = "";
  switch (variant) {
    case "secondary":
      colorClass = "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-light)]";
      break;
    case "danger":
      colorClass = "bg-[var(--color-error)] text-white hover:bg-red-600";
      break;
    default:
      colorClass = "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]";
  }
  return (
    <button className={`${base} ${sizeClass} ${colorClass}`} {...props}>
      {children}
    </button>
  );
};

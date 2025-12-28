import React from "react";
import { tokens } from "../theme/tokens";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, children, className }) => (
  <div className={`flex flex-col items-center justify-center py-12 text-center text-[var(--color-text-secondary)] ${className || ""}`}>
    {icon && <div className="mb-3 text-4xl">{icon}</div>}
    {title && <div className="text-[var(--font-lg)] font-semibold mb-1">{title}</div>}
    {description && <div className="text-[var(--font-md)] mb-2">{description}</div>}
    {children}
  </div>
);

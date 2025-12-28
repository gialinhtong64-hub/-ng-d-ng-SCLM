import React from "react";
import { tokens } from "../theme/tokens";

interface SectionTitleProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, icon, className }) => (
  <div className={`flex items-center gap-2 text-[var(--font-lg)] font-semibold text-[var(--color-text)] mb-2 ${className || ""}`}>
    {icon && <span className="text-[var(--icon-size)]">{icon}</span>}
    <span>{children}</span>
  </div>
);

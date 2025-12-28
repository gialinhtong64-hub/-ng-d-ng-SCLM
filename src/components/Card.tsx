import React from "react";
import { tokens } from "../theme/tokens";

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = "", style }) => (
  <div
    className={
      `rounded-[${tokens.radius.card}] bg-[${tokens.color.surface}] shadow-[${tokens.shadow.card}] border border-[${tokens.color.border}] ` +
      className
    }
    style={{
      borderRadius: tokens.radius.card,
      background: tokens.color.surface,
      boxShadow: tokens.shadow.card,
      border: `1px solid ${tokens.color.border}`,
      ...style,
    }}
  >
    {children}
  </div>
);

import React from "react";
import { tokens } from "../theme/tokens";

export const ProText: React.FC<{
  children: React.ReactNode;
  size?: keyof typeof tokens.font.size;
  weight?: keyof typeof tokens.font.weight;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, size = "md", weight = "regular", color, className = "", style }) => (
  <span
    className={className}
    style={{
      fontFamily: tokens.font.family,
      fontSize: tokens.font.size[size],
      fontWeight: tokens.font.weight[weight],
      color: color || tokens.color.text,
      letterSpacing: tokens.font.letterSpacing,
      ...style,
    }}
  >
    {children}
  </span>
);

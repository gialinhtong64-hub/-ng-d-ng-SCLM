import React from "react";
import { tokens } from "../theme/tokens";

export const EmojiIcon: React.FC<{
  emoji: string;
  label?: string;
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ emoji, label, size = tokens.icon.size, className = "", style }) => (
  <span
    role="img"
    aria-label={label || "icon"}
    className={className}
    style={{
      fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",NotoColorEmoji,sans-serif',
      fontSize: size,
      display: 'inline-block',
      lineHeight: 1,
      verticalAlign: 'middle',
      ...style,
    }}
  >
    {emoji}
  </span>
);

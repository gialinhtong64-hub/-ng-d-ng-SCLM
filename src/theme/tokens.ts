// Design tokens for SCLM App
export const tokens = {
  color: {
    primary: '#2563eb', // blue-600
    primaryDark: '#1e40af', // blue-800
    accent: '#06b6d4', // cyan-500
    background: '#0f172a', // slate-900
    surface: '#181f2e', // custom dark card
    surfaceLight: '#232b3e', // slightly lighter card
    border: '#334155', // slate-700
    divider: '#475569', // slate-600
    text: '#f1f5f9', // slate-50
    textSecondary: '#94a3b8', // slate-400
    textDisabled: '#64748b', // slate-500
    success: '#22c55e', // green-500
    warning: '#facc15', // yellow-400
    error: '#ef4444', // red-500
    info: '#38bdf8', // sky-400
    white: '#f8fafc', // slate-50
    black: '#020617', // slate-950
    vip: '#fbbf24', // amber-400
    vipDark: '#b45309', // amber-700
    overlay: 'rgba(15,23,42,0.7)',
  },
  radius: {
    card: '1.25rem', // 20px
    button: '0.75rem', // 12px
    input: '0.75rem',
    full: '9999px',
  },
  shadow: {
    card: '0 4px 24px 0 rgba(16,30,54,0.12)',
    button: '0 2px 8px 0 rgba(16,30,54,0.10)',
    focus: '0 0 0 2px #2563eb44',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  font: {
    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    letterSpacing: '-0.01em',
  },
  transition: {
    fast: '120ms',
    normal: '240ms',
    slow: '400ms',
  },
  z: {
    header: 100,
    modal: 1000,
    overlay: 900,
    nav: 200,
  },
  icon: {
    size: '1.5rem',
    color: '#94a3b8',
  },
};

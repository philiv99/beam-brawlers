/**
 * LinkittyDo Theme Configuration for Beam Brawlers
 */

export const linkittydoTheme = {
  colors: {
    // Core LinkittyDo palette
    cream: '#FDEC92',
    mint: '#A9EAD2',
    ink: '#161813',
    pop: '#FB2B57',
    paper: '#EEEDE5',

    // Extended palette for wrestling theme
    gold: '#FFD700',
    blue: '#4A90D9',
    red: '#E74C3C',
    warning: '#F39C12',

    // Muted supports
    mutedOlive: '#5E6554',
    mutedGold: '#A29A61',
    mutedPeach: '#E7A790',
  },

  fonts: {
    headline: "'Bungee', cursive",
    body: "'Nunito', sans-serif",
  },

  fontSizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    sm: '2px 2px 0px rgba(22, 24, 19, 0.2)',
    md: '4px 4px 0px rgba(22, 24, 19, 0.25)',
    lg: '6px 6px 0px rgba(22, 24, 19, 0.3)',
    pop: '4px 4px 0px #161813',
  },

  transitions: {
    fast: '150ms ease-out',
    normal: '250ms ease-out',
    slow: '400ms ease-out',
  },
} as const;

export type Theme = typeof linkittydoTheme;
export default linkittydoTheme;

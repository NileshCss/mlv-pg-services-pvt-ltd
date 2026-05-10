// Design System - Dark Luxury Enterprise Theme for MLV Admin Dashboard

export const DESIGN_SYSTEM = {
  // Core Colors
  colors: {
    // Primary Background
    bgPrimary: '#0A0E1A',      // deep navy-black
    bgSecondary: '#0F1629',    // dark navy
    bgTertiary: '#1a1f3a',     // even darker blue
    
    // Card/Surface
    cardBg: 'rgba(15, 22, 41, 0.8)',  // with transparency
    cardBgHover: 'rgba(15, 22, 41, 0.95)',
    
    // Sidebar
    sidebarBg: '#080C18',
    sidebarBorder: 'rgba(245, 166, 35, 0.1)',  // gold border
    
    // Accents - Gold Theme
    gold: '#F5A623',           // primary CTA, highlights
    goldLight: '#FFD166',      // hover states
    goldDark: '#C8840A',       // pressed states
    
    // Text
    textPrimary: '#F0F4FF',    // main text
    textSecondary: '#8892AA',  // secondary text
    textMuted: '#4A5568',      // muted text
    
    // Borders
    border: 'rgba(245, 166, 35, 0.15)',  // gold border
    borderHover: 'rgba(245, 166, 35, 0.3)',
    
    // Status Colors
    status: {
      new: '#3B82F6',              // blue
      interested: '#F59E0B',       // yellow/amber
      contacted: '#8B5CF6',        // purple
      confirmed: '#10B981',        // green
      checkedIn: '#06B6D4',        // cyan
      cancelled: '#EF4444',        // red
    },
    
    statusBg: {
      new: 'rgba(59, 130, 246, 0.2)',
      interested: 'rgba(245, 158, 11, 0.2)',
      contacted: 'rgba(139, 92, 246, 0.2)',
      confirmed: 'rgba(16, 185, 129, 0.2)',
      checkedIn: 'rgba(6, 182, 212, 0.2)',
      cancelled: 'rgba(239, 68, 68, 0.2)',
    },
    
    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },

  // Typography
  typography: {
    // Fonts to import from Google Fonts
    fonts: {
      display: "'Playfair Display', serif",  // Luxury, editorial
      body: "'DM Sans', sans-serif",         // Clean, modern
      mono: "'JetBrains Mono', monospace",   // Data, IDs
    },
    
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
  },

  // Shadows
  shadows: {
    sm: 'shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
    base: 'shadow-[0_1px_3px_rgba(0,0,0,0.1)]',
    md: 'shadow-[0_4px_6px_rgba(0,0,0,0.1)]',
    lg: 'shadow-[0_8px_16px_rgba(0,0,0,0.2)]',
    xl: 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',  // Premium card shadow
    gold: 'shadow-[0_8px_32px_rgba(245,166,35,0.15)]',  // Gold glow
  },

  // Border Radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.875rem',
    xl: '1rem',
    '2xl': '1rem',  // Used on cards, modals, inputs
  },

  // Transitions
  transitions: {
    default: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out',
    fast: 'transition-all duration-100 ease-out',
  },

  // Component Patterns
  components: {
    card: {
      base: 'rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
      hover: 'hover:-translate-y-0.5 hover:shadow-gold transition-all duration-200',
      premium: 'rounded-2xl bg-white/5 backdrop-blur-xl border border-amber-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
    },

    input: {
      base: 'rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400',
      focus: 'focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20',
    },

    button: {
      primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all duration-200 hover:shadow-gold',
      secondary: 'bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20',
      ghost: 'hover:bg-white/10 text-white rounded-lg transition-all duration-200',
    },

    sidebarItem: {
      active: 'left-0 border-l-3 border-amber-500 bg-amber-500/10 text-amber-400',
      inactive: 'text-gray-400 hover:text-gray-300 hover:bg-white/5',
    },
  },
}

// Tailwind CSS Custom Color Palette (for tailwind.config.ts)
export const tailwindTheme = {
  extend: {
    colors: {
      mlv: {
        dark: '#0A0E1A',
        darker: '#080C18',
        card: 'rgba(15, 22, 41, 0.8)',
        gold: '#F5A623',
        'gold-light': '#FFD166',
        'gold-dark': '#C8840A',
        'text-primary': '#F0F4FF',
        'text-secondary': '#8892AA',
      },
    },
    fontFamily: {
      display: ["'Playfair Display'", 'serif'],
      body: ["'DM Sans'", 'sans-serif'],
      mono: ["'JetBrains Mono'", 'monospace'],
    },
    boxShadow: {
      gold: '0 8px 32px rgba(245, 166, 35, 0.15)',
      'card-premium': '0 8px 32px rgba(0, 0, 0, 0.4)',
    },
  },
}

// Chart Colors (for Recharts)
export const chartColors = {
  bars: ['#F5A623', '#3B82F6', '#10B981', '#8B5CF6'],
  line: '#F5A623',
  fill: 'rgba(245, 166, 35, 0.1)',
  stroke: '#F5A623',
  text: '#8892AA',
  grid: 'rgba(255, 255, 255, 0.05)',
}

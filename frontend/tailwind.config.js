/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Duty and Honor Design Tokens (from DESIGN.md) ────────────────────
      colors: {
        // Primary – Olive Green (military identity)
        olive: {
          900: '#191e00',
          800: '#343c0a',
          700: '#434b18',
          600: '#4b5320',
          500: '#5a632e',
          400: '#c3cc8c',
          300: '#dfe8a6',
          DEFAULT: '#4b5320',
        },
        // Secondary – Deep Saffron (national accent)
        saffron: {
          900: '#2e1500',
          800: '#683700',
          700: '#8f4e00',
          600: '#fe9832',
          500: '#ffb77a',
          400: '#ffdcc2',
          DEFAULT: '#fe9832',
        },
        // Tertiary – Navy Blue (institutional depth)
        navy: {
          900: '#00006e',
          700: '#222894',
          500: '#3b42ab',
          300: '#b8bbff',
          100: '#e0e0ff',
          DEFAULT: '#222894',
        },
        // Surface & background tokens
        surface: '#f8f9fa',
        'surface-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'on-surface': '#191c1d',
        'on-surface-variant': '#47483c',
        outline: '#77786b',
        'outline-variant': '#c8c7b8',
        // Error
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-md': ['16px', { lineHeight: '24px' }],
        'label': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '700' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      maxWidth: {
        container: '1200px',
      },

      // ── Border radius (military "soft" = 4px) ────────────────────────────
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },

      // ── Keyframes for skeleton loader ─────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'skeleton-pulse': 'pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F0E6',
        cream: '#FFF9F1',
        softBeige: '#E9D9C6',
        sand: '#D6BDA4',
        taupe: '#A78B73',
        espresso: '#4B2F1F',
        deepBrown: '#302219',
        charcoal: '#282522',
        muted: '#82776D',
        success: '#387653',
        warning: '#B77932',
        error: '#B44D42',
        /* Glass colors */
        glassLight: 'rgba(255, 249, 241, 0.76)',
        glassBorder: 'rgba(255, 255, 255, 0.62)',
        glassDark: 'rgba(48, 34, 25, 0.76)',
        glassDarkBorder: 'rgba(255, 255, 255, 0.4)',
        /* Sidebar */
        sidebar: '#302219',
        /* Status badge colors */
        badgePending: 'rgba(183, 121, 50, 0.15)',
        badgeApproved: 'rgba(56, 118, 83, 0.15)',
        badgeRejected: 'rgba(180, 77, 66, 0.15)',
        badgeCheckedIn: 'rgba(75, 47, 31, 0.15)',
        badgeReturned: 'rgba(130, 119, 109, 0.1)',
        badgeCancelled: 'rgba(130, 119, 109, 0.08)',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '20px',
        pill: '9999px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-height)' },
          to: { height: 0 },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: 1 },
          '20%,50%': { opacity: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
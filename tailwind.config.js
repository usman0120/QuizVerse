// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js}",
    "./sections/**/*.{html,js}",
    "./tools/**/*.{html,js}",
    "./suggest-tool.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: '#2D6A4F',
        secondary: '#40916C',
        accent: '#FFB703',
        textDark: '#1D1D1D',
        textLight: '#FFFFFF',
        bgLight: '#F9F9F9',
        bgDark: '#121212',
        error: '#D00000',
        success: '#007F5F',
        warning: '#F48C06',
        info: '#3A0CA3',
        
        // Category colors
        science: '#0077B6',
        general: '#F77F00',
        poetry: '#D4A5A5',
        history: '#7B5E57',
        islamic: '#2A9D8F',
        tech: '#3A0CA3',
        arts: '#7209B7',
        kids: '#90E0EF',
        boys: '#5D737E',
        girls: '#FFCDB2',
      },
      opacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'nastaliq': ['Noto Nastaliq Urdu', 'serif']
      },
      backdropBlur: {
        'sm': '5px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'xl': '0 10px 25px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'transform': 'transform',
      },
    },
  },
  variants: {
    extend: {
      backdropBlur: ['hover', 'focus'],
      backdropFilter: ['hover', 'focus'],
      borderColor: ['dark'],
      opacity: ['dark'],
      scale: ['hover', 'active'],
      transform: ['hover', 'focus'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-filters'),
  ],
  darkMode: 'class',
  safelist: [
    'bg-brand',
    'bg-secondary',
    'bg-accent',
    'bg-science',
    'bg-general',
    'bg-poetry',
    'bg-history',
    'bg-islamic',
    'bg-tech',
    'bg-arts',
    'bg-kids',
    'bg-boys',
    'bg-girls',
    'text-brand',
    'text-secondary',
    'text-accent',
    'text-science',
    'text-general',
    'text-poetry',
    'text-history',
    'text-islamic',
    'text-tech',
    'text-arts',
    'text-kids',
    'text-boys',
    'text-girls',
    'border-brand',
    'border-secondary',
    'border-accent',
    'border-science',
    'border-general',
    'border-poetry',
    'border-history',
    'border-islamic',
    'border-tech',
    'border-arts',
    'border-kids',
    'border-boys',
    'border-girls',
    'fa-flask',
    'fa-laptop-code',
    'fa-globe',
    'fa-book-open',
    'fa-film',
    'fa-music',
    'fa-theater-masks',
    'fa-tv',
    'fa-gamepad',
    'fa-chess-board',
    'fa-mosque',
    'fa-pen-fancy',
    'fa-landmark',
    'fa-palette',
    'fa-child',
    'fa-question-circle'
  ]
}
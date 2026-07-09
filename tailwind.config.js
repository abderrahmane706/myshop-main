/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        brand: {
          primary: '#0B3C91',
          'primary-50': '#E8EEF9',
          'primary-100': '#C4D3EF',
          'primary-600': '#0B3C91',
          'primary-700': '#082E70',
          'primary-900': '#031540',
          royal: '#1E5EFF',
          'royal-50': '#EBF1FF',
          'royal-100': '#D6E2FF',
          'royal-600': '#1E5EFF',
          'royal-700': '#1949CC',
          orange: '#FF7A00',
          'orange-hover': '#E86100',
          'orange-50': '#FFF2E5',
          bg: '#F7F9FC',
          'bg-alt': '#EEF2F8',
          dark: '#0E1726',
          'dark-2': '#111C2F',
          text: '#1F2937',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0B3C91 0%, #1E5EFF 50%, #FF7A00 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #0B3C91 0%, #1E5EFF 100%)',
        'brand-radial': 'radial-gradient(ellipse at top, rgba(30,94,255,0.15), transparent 70%)',
      },
      borderRadius: {
        lg: '18px',
        md: '14px',
        sm: '10px',
        xl: '22px',
      },
      boxShadow: {
        'soft': '0 4px 24px -8px rgba(11, 60, 145, 0.10)',
        'soft-lg': '0 10px 40px -12px rgba(11, 60, 145, 0.18)',
        'brand': '0 12px 30px -8px rgba(30, 94, 255, 0.35)',
        'orange': '0 10px 30px -8px rgba(255, 122, 0, 0.45)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'shimmer': { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}

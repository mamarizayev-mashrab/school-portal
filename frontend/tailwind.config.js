/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                vercel: {
                    bg: '#000000',
                    surface: '#111111',
                    'surface-2': '#171717',
                    'surface-3': '#1a1a1a',
                    border: '#333333',
                    'border-light': '#444444',
                    text: '#EDEDED',
                    'text-secondary': '#888888',
                    'text-tertiary': '#666666',
                    accent: '#0070F3',
                    'accent-hover': '#0060DF',
                    'accent-light': '#3291FF',
                    success: '#50E3C2',
                    'success-dark': '#0DA67F',
                    error: '#EE0000',
                    'error-light': '#FF4444',
                    warning: '#F5A623',
                    'warning-light': '#FFD700',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-delay': 'fadeIn 0.5s ease-out 0.1s both',
                'fade-in-delay-2': 'fadeIn 0.5s ease-out 0.2s both',
                'fade-in-delay-3': 'fadeIn 0.5s ease-out 0.3s both',
                'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-down': 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'shimmer-glow': 'shimmerGlow 3s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                shimmerGlow: {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-accent': '0 0 20px rgba(0, 112, 243, 0.15)',
                'glow-success': '0 0 20px rgba(80, 227, 194, 0.15)',
                'glow-warning': '0 0 20px rgba(245, 166, 35, 0.15)',
                'glow-error': '0 0 20px rgba(238, 0, 0, 0.15)',
                'card': '0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.14)',
                'card-hover': '0 4px 12px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.2)',
            }
        },
    },
    plugins: [],
}

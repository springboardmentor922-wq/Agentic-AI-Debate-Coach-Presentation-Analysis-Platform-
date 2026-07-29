/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Void — the app's navy-black base, not flat black
        ink: {
          950: '#080B12',
          900: '#0F1420',
          800: '#171F30',
          700: '#232D42',
          600: '#33405C',
        },
        // Argon — cool "logic" accent, primary brand color
        brand: {
          50: '#EAF5FF',
          100: '#D2EAFF',
          200: '#A6D5FF',
          300: '#6FBBFF',
          400: '#3FA9F5',
          500: '#2B93E0',
          600: '#1D77BD',
          700: '#175E96',
          800: '#144B78',
          900: '#123E61',
        },
        // Ember — warm "persuasion" accent, contrast counterpart to Argon
        accent: {
          50: '#FFF0EA',
          100: '#FFDCCC',
          200: '#FFB799',
          300: '#FF9670',
          400: '#FF7A50',
          500: '#F0602F',
          600: '#CC4A20',
          700: '#A33A19',
        },
        // Verdict — score / success teal-green
        verdict: {
          50: '#E7FBF4',
          100: '#C3F5E3',
          300: '#6EE3BE',
          400: '#2FD9A8',
          500: '#1FBE8F',
          600: '#189A73',
        },
        // Alert — fallacy / danger rose
        alert: {
          50: '#FFEEF1',
          100: '#FFD3DA',
          300: '#FF8C9E',
          400: '#FF5470',
          500: '#E63A57',
          600: '#BC2C44',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'ui-sans-serif', 'system-ui'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(4, 8, 20, 0.35)',
        premium: '0 20px 60px -15px rgba(63, 169, 245, 0.45)',
        ember: '0 20px 60px -15px rgba(255, 122, 80, 0.4)',
        'glow-argon': '0 0 0 1px rgba(63, 169, 245, 0.4), 0 0 24px rgba(63, 169, 245, 0.25)',
        'glow-ember': '0 0 0 1px rgba(255, 122, 80, 0.4), 0 0 24px rgba(255, 122, 80, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(circle at 15% 0%, rgba(63,169,245,0.16) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(255,122,80,0.12) 0%, transparent 40%)',
      },
      keyframes: {
        pulseBar: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        pulseBar: 'pulseBar 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

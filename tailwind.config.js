/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#66CCFF',       // 新的主色调 - 浅蓝
        secondary: '#FF9ED8',     // 配套粉色
        accent: '#FFC857',        // 橙黄色 - 强调色
        tertiary: '#7DEFA1',      // 嫩绿色
        background: '#F9FDFF',    // 浅蓝背景
        cardBg: '#FFFFFF',        // 卡片背景
        textPrimary: '#465775',   // 主文本
        textSecondary: '#7A8DA0', // 次要文本
        border: '#E8F4FF',        // 边框颜色
        macos: {
          blue: {
            light: '#007AFF',
            dark: '#0A84FF',
          },
          gray: {
            50: '#F9F9F9',
            100: '#F2F2F2',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#282828',
            900: '#171717',
          },
        },
      },
      borderRadius: {
        'macos': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'macos': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'macos-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'macos-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'macos-dark': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'cartoon': '0 8px 24px rgba(102, 204, 255, 0.15), 0 4px 8px rgba(102, 204, 255, 0.08)',
        'cartoon-sm': '0 4px 12px rgba(102, 204, 255, 0.08), 0 2px 4px rgba(102, 204, 255, 0.04)',
        'cartoon-hover': '0 12px 28px rgba(102, 204, 255, 0.25), 0 6px 10px rgba(102, 204, 255, 0.15)',
        'button': '0 4px 0 0 rgba(102, 204, 255, 0.25)',
        'button-pressed': '0 2px 0 0 rgba(102, 204, 255, 0.25)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-in-out',
        'slide-in-top': 'slideInTop 0.3s ease-in-out',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}; 
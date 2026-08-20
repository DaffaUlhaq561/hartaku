/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "hartaku-green": "#00261a",
        "hartaku-green-dark": "#061f16",
        "hartaku-emerald": "#10b981",
        "hartaku-paper": "#fdf9ee",
        "hartaku-passbook": "#f7f3e8",
        "hartaku-desk": "#e6e2d8",
        "hartaku-border": "#c0c8c3",
        "hartaku-gold": "#fed255",
        "hartaku-gold-text": "#755b00",
        "hartaku-zombie": "#93000a",
        "hartaku-zombie-bg": "#ffdad6",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Courier Prime"', 'monospace'],
      },
      boxShadow: {
        'passbook': '-10px 0 20px -5px rgba(0,0,0,0.1), inset 15px 0 20px -10px rgba(0,0,0,0.05)',
        'passbook-spine': 'inset -5px 0 10px rgba(0,0,0,0.08), 8px 12px 24px -4px rgba(0,0,0,0.12)',
        'stamp': '0 4px 12px rgba(147,0,10,0.25)'
      }
    },
  },
  plugins: [],
}

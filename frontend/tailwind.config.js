/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ops: {
          bg: "#0c1219",
          panel: "#121a24",
          panel2: "#172231",
          border: "#243246",
          muted: "#8b9bb0",
          text: "#e8eef6",
          accent: "#2dd4bf",
          warn: "#f59e0b",
          danger: "#f87171",
          ok: "#34d399",
          line: "#3b82f6",
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "Segoe UI", "sans-serif"],
        mono: ['"IBM Plex Mono"', "Consolas", "monospace"],
      },
      boxShadow: {
        panel: "0 8px 28px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

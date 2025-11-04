/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1020", // fundo mais profundo
        panel: "#0f1528",
        panel2: "#1a2040",
        ink: "#e6e9f5",
        // acentos “neon”
        neon: {
          mint: "#00f5d4",
          violet: "#8b5cf6",
          rose: "#ff4d6d",
          amber: "#f59e0b",
        },
      },
      boxShadow: {
        glass: "0 8px 30px rgba(2,8,23,.35)",
        glow: "0 0 0 2px rgba(139,92,246,.35)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};

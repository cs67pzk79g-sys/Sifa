import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marine: {
          50: "#f1f5f9",
          100: "#e2e8f0",
          200: "#cbd5e1",
          600: "#1f4b73",
          700: "#1a3f61",
          800: "#15334e",
          900: "#102639",
        },
      },
      fontFamily: {
        // System font stack on purpose: no external font CDN (data protection).
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px"
      }
    },
    extend: {
      colors: {
        ink: "#1f1d1a",
        sand: "#f6f2ea",
        moss: "#8b9b6f",
        clay: "#d9b8a4",
        ember: "#c4553d",
        sky: "#d5e9f5",
        pine: "#2b4a3f"
      },
      boxShadow: {
        card: "0 20px 40px -30px rgba(31, 29, 26, 0.35)",
        soft: "0 10px 30px -20px rgba(31, 29, 26, 0.35)"
      },
      borderRadius: {
        xl: "1.25rem"
      },
      fontFamily: {
        display: ["Space Grotesk", "Pretendard", "Noto Sans KR", "sans-serif"],
        body: ["SUIT", "Pretendard", "Noto Sans KR", "sans-serif"]
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;

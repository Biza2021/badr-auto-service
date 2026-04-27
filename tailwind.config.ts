import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0f172a",
        charcoal: "#222831",
        steel: "#343a40",
        accent: "#f97316",
        mist: "#f5f7fa"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(15, 23, 42, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;

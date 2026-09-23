import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { ink: "#17201d", moss: "#1f6b4f", mist: "#f3f6f3" } } },
  plugins: [],
};

export default config;

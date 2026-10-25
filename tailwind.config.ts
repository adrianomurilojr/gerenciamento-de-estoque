import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: "#c9a44c",
        forest: "#174b3a",
      },
    },
  },
  plugins: [],
};

export default config;

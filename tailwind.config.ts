import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        dark: "#0C1320",
        "light-dark": "#131B2A",
      },
      boxShadow: {
        custom: "0px 5px 0 0 rgba(39,39,42,1)",
        "custom-dark": "0px 4px 0 0 rgba(255,255,255,1)",
        "custom-orange": "0px 4px 0 0 rgba(249,115,22,1)",
        "custom-orange-clicked": "0px 2px 0 0 rgba(249,115,22,1)",
      },
    },
  },
  darkMode: "selector",
  plugins: [],
} satisfies Config;

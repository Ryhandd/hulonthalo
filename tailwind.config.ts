import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warna identitas dari Design Brief
        terakota: { DEFAULT: "#A65234", dark: "#873F25" },
        zaitun: { DEFAULT: "#6E7A42", dark: "#566033" },
        rempah: "#D4A338",
        krim: "#F9F6EE",
        arang: "#2B211B",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  // Efek hover hanya aktif di perangkat yang punya kursor (tidak "nyangkut" di layar sentuh)
  future: { hoverOnlyWhenSupported: true },
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
      keyframes: {
        pageIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        barIn: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "page-in": "pageIn .24s ease-out",
        "bar-in": "barIn .2s ease-out",
        pop: "pop .25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;

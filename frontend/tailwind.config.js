/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        choForest: "#222C2A",
        choSand: "#F3EED9",
        choClay: "#824936",
      },
      fontFamily: {
        heading: ['"Playfair Display"', "serif"],
        body: ['"Roboto"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f6f1e8",
        clay: "#e9dfd2",
        sage: "#2f5e4e",
        ocean: "#4f7c8d",
        saffron: "#d9a441",
        ink: "#2c2a26",
        mist: "#f0f4f2"
      },
      fontFamily: {
        heading: ["Fraunces", "serif"],
        body: ["Work Sans", "sans-serif"]
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

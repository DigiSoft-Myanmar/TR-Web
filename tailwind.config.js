/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", ...defaultTheme.fontFamily.sans],
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
        myanmarAngoun: ["MyanmarAngoun", ...defaultTheme.fontFamily.sans],
        pyidaungsu: ["Pyidaungsu", ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        auto280: "repeat(auto-fill, minmax(280px, 1fr))",
        auto150: "repeat(auto-fill, minmax(160px, 1fr))",
        auto200: "repeat(auto-fill, minmax(200px, 1fr))",
      },
      colors: {
        primary: "#F5D72E",
        gold: "#9B7027",
        disabled: "#64748b",
        secondary: "#E2C044",
        accent: "#8C8316",
        neutral: "#BFBFBF",
        info: "#2196F3",
        success: "#78BE20",
        warning: "#FF9800",
        error: "#F44336",
        primaryText: "#333333",
        secondaryText: "#888888",
        primaryBg: "#FFFFFF",
        sellerBg: "#1D1D1D",
      },
      backgroundImage: {
        sectionBg:
          "linear-gradient(44.58deg,#f5d72e -600.63%,rgba(29,29,29,0) 41.37%,rgba(32,32,32,0) 75.93%,rgba(245,215,46,.58) 144.75%)",
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          primary: "#F7E250",
          gold: "#9B7027",
          secondary: "#E2C044",
          accent: "#8C8316",
          neutral: "#BFBFBF",
          info: "#2196F3",
          success: "#78BE20",
          warning: "#FF9800",
          error: "#F44336",
          primaryText: "#333333",
          secondaryText: "#888888",
          primaryBg: "#FFFFFF",
          sellerBg: "#1C1C1C",
        },
      },
    ],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("tailwind-scrollbar-hide"),
    require("daisyui"),
  ],
};

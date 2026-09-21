/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B3A57",
        secondary: "#2C5F8A",
        accent: "#3A7D44",
        warning: "#B08C1E",
        danger: "#A83A3A",
        success: "#2D7A3E",
      },
    },
  },
  plugins: [],
}

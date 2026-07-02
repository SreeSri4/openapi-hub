/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
      extend: {
        colors: {
          vistex: {
            bg: "#ffffff",
            bgAlt: "#f5f7fa",
            navy: "#0b1f3d",
          },
        },
      },
    },
  plugins: [],
}

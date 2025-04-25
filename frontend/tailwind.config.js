/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}", // Add this line to include components
  ],
  theme: {
    extend: {
      // You can add custom colors, fonts, etc. here
    },
  },
  plugins: [],
};

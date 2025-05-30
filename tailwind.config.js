/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,css}",  // src folder ke sab JS, TS, JSX, TSX files
    "./pages/**/*.{js,ts,jsx,tsx}", // pages folder ke sab JS, TS, JSX, TSX files
    "./components/**/*.{js,ts,jsx,tsx}", // components folder ke sab JS, TS, JSX, TSX files
    "./app/**/*.{js,ts,jsx,tsx}" // agar Next.js app directory hai to
  ],
  theme: {},
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        geistLight: ["Geist-Light", "sans-serif"],
        geistRegular: ["Geist-Regular", "sans-serif"],
        geistMedium: ["Geist-Medium", "sans-serif"],
        geistSemiBold: ["Geist-SemiBold", "sans-serif"],

        geistExtraBold: ["Geist-ExtraBold", "sans-serif"],
        geistBold: ["Geist-Bold", "sans-serif"],
        geistBlack: ["Geist-Black", "sans-serif"],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
    },
  },
  plugins: [],
};

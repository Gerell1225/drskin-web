// tailwind.config.js (optional)
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1rem", screens: { lg: "1024px", xl: "1120px", "2xl": "1200px" } },
    extend: {
      colors: { brand: "#D42121" },
      borderRadius: { "2xl": "1rem" },
      boxShadow: { soft: "0 4px 14px 0 rgba(0,0,0,0.06)" },
    },
  },
};

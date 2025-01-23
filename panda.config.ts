import { defineConfig } from "@pandacss/dev";

console.log('panda config read')
export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  jsxFramework: 'react',
  jsxStyleProps: 'minimal',
  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {},
  },

  // The output directory for your css system
  outdir: "styled-system",
  importMap: "./styled-system",
});

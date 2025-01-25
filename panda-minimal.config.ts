import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // intentionally points to files that don't exist because the Vite plugin will add files to the context as Vite builds
  include: ['./noop/**/*.{js,jsx,ts,tsx}'],
  jsxFramework: 'react',
  // Files to exclude

  // Useful for theme customization
  theme: {
    extend: {},
  },

  // The output directory for your css system
  outdir: "styled-system",
  importMap: "./styled-system",
});

import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { Builder } from "@pandacss/node";
import type { PluginCreator } from "postcss";

const builder = new Builder();
builder.setup();
await builder.setupContext({ configPath: "./panda.config.ts" });

const myPlugin = (): Plugin => {
  return {
    name: "my-plugin",
    transform(src, id) {
      builder.context?.project.addSourceFile(id, src);
      return { code: src };
    },
  };
};
const postcssPlugin: PluginCreator<{}> = () => {
  return {
    postcssPlugin: "postcss-plugin",
    plugins: [
      async (root, result) => {
        await builder.emit();
        builder.extract();
        builder.write(root);
      },
    ],
  };
};

export default defineConfig({
  plugins: [react(), myPlugin()],
  css: {
    postcss: {
      plugins: [postcssPlugin()],
    },
  },
});
postcssPlugin.postcss = true;

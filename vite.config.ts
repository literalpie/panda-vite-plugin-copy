/// <reference types="vite/client" />
import { defineConfig, ModuleNode, Plugin } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { Builder, PandaContext } from "@pandacss/node";
import { minimatch } from "minimatch";
import pandacss from "@pandacss/dev/postcss";

const panda = async ({
  configPath,
  cwd,
}: { configPath?: string; cwd?: string } = {}): Promise<Plugin> => {
  const builder = new Builder();
  await builder.setup({ configPath, cwd });
  const accumulatedFilesSet = new Set<string>();
  const ctx = builder.context;

  let skipNextCssUpdate = false;
  let cssUpdateTimeout: NodeJS.Timeout | null = null;
  const bundleStyles = async (
    ctx: PandaContext,
    changedFilePath: string,
    debounce = false
  ) => {
    const outfile = ctx.runtime.path.join(...ctx.paths.root, "styles.css");
    const parserResult = ctx.project.parseSourceFile(changedFilePath);
    // Based on Panda's cli: https://github.com/chakra-ui/panda/blob/c2612b7127/packages/node/src/generate.ts
    if (parserResult) {
      const sheet = ctx.createSheet();
      ctx.appendLayerParams(sheet);
      ctx.appendBaselineCss(sheet);
      ctx.appendParserCss(sheet);
      const css = ctx.getCss(sheet);

      // Debounce writing the file because we only want to write once on the initial load when many files are parsed
      if (debounce) {
        if (cssUpdateTimeout) {
          clearTimeout(cssUpdateTimeout);
        }
        cssUpdateTimeout = setTimeout(async () => {
          const css = ctx.getCss(sheet);
          await ctx.runtime.fs.writeFile(outfile, css);
        }, 100);
      } else {
        await ctx.runtime.fs.writeFile(outfile, css);
      }
    }
  };
  return {
    name: "vite-plugin-panda",
    watchChange(id, change) {
      if (!ctx) return;
      // I don't know if removing source files, or reloading really makes a difference compared to adding each time it's transformed.
      if (change.event === "delete") {
        accumulatedFilesSet.delete(id);
        ctx.project.removeSourceFile(id);
      }
    },
    transformIndexHtml(html) {
      const ctx = builder.context;
      if (!ctx) return html;
      // Maybe we should instead do something that would work for production too.
      // It would also work to add the import to the main.ts or any other file.
      const outfile = ctx.runtime.path.join(...ctx.paths.root, "styles.css");
      return html.replace(
        "</head>",
        `<link rel="stylesheet" href="${outfile}"></head>`
      );
    },
    handleHotUpdate: async ({ server, file, modules }) => {
      if (!ctx) return modules;
      const relativeId = path.relative(__dirname, file);
      const outfile = ctx.runtime.path.join(...ctx.paths.root, "styles.css");
      if (minimatch(relativeId, "src/**/*.{js,jsx,ts,tsx}")) {
        // Let panda update css based on changes
        ctx?.project.reloadSourceFile(file);
        await bundleStyles(ctx, file);

        const pandaCss = server?.moduleGraph.getModuleById(outfile + "?direct");
        skipNextCssUpdate = true;
        return [...modules, pandaCss].filter(Boolean) as ModuleNode[];
      } else if (file === outfile && skipNextCssUpdate) {
        // Since we include the css file in the update, we ignore the next time that file is updated.
        skipNextCssUpdate = false;
        return modules.filter((module) => module.id !== outfile + "?direct");
      }
    },
    // When files are transformed for the first time, add them to the panda builder so it can write the css
    async transform(src, id) {
      const relativeId = path.relative(__dirname, id);
      // Ideally, we should allow setting include values in the panda.config, and ignore them in the context and use them here.
      if (
        minimatch(relativeId, "src/**/*.{js,jsx,ts,tsx}") &&
        ctx !== undefined
      ) {
        if (accumulatedFilesSet.has(id)) {
          // updates are handled in the hotUpdates hook
        } else {
          accumulatedFilesSet.add(id);
          builder.context?.project.createSourceFile(id);
          bundleStyles(ctx, id, true);
        }
      }
      return { code: src };
    },
  };
};

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "plugin" && panda({ configPath: "./panda-minimal.config.ts" }),
    mode === 'cli' && {
      name: 'panda-cli',
      transformIndexHtml: (html) => {
        return html.replace(
          "</head>",
          `<link rel="stylesheet" href="./styled-system/styles.css"></head>`
        );
  
      }
    }
  ],
  css: {
    postcss: {
      plugins: mode === "postcss" ? [pandacss()] : [],
    },
  },
}));

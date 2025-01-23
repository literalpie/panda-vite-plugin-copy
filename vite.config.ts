import { defineConfig, Plugin } from "vite";
import path from "path";
import fs from "fs";
import react from "@vitejs/plugin-react";
import { Builder } from "@pandacss/node";
import type { PluginCreator, TransformCallback } from "postcss";
import {minimatch} from 'minimatch';

const tempConfigPath = path.resolve(__dirname, 'temp.panda.config.ts');

// Makes a panda config file that only includes certain files
const writeTempConfig = (files: string[]) => {
  const includeArray = files.map((file)=>`'${file}'`).join(',');
  fs.writeFileSync(tempConfigPath, `
    import { defineConfig } from "@pandacss/dev";
  
    export default defineConfig({
      // Whether to use css reset
      preflight: true,
  
      // Where to look for your css declarations
      include: [${includeArray}],
  
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
  `);
}


const builder = new Builder();
await builder.setup({configPath: './temp.panda.config.ts'});
// await builder.setupContext({ configPath: "./temp.panda.config.ts" });
writeTempConfig([]);
const accumulatedFilesSet = new Set<string>();

const myPlugin = (): Plugin => {
  return {
    name: "my-plugin",
    transform(src, id) {
      console.log('transform', id)
      // Any time Vite transforms a file and it matches the include pattern,
      // we add it to the generated temporary panda.config.ts
      const relativeId = path.relative(__dirname, id);
      if(minimatch(relativeId, "src/**/*.{js,jsx,ts,tsx}") && !accumulatedFilesSet.has(id)) {
        console.log('adding for first time', id)
        accumulatedFilesSet.add(id);
        writeTempConfig([...accumulatedFilesSet]);
      } 
      return { code: src };
    },
  };
};
const PLUGIN_NAME = 'my-pandacss'
let builderGuard: Promise<void> | undefined

const postcssPlugin: PluginCreator<unknown> = () => {

  const postcssProcess: TransformCallback = async function (root, result) {
    const fileName = result.opts.from

    const skip = shouldSkip(fileName)
    if (skip) return
    // I don't know why this setup is needed, since we do it at the begining of the file.
    await builder.setup({ configPath:'temp.panda.config.ts', cwd:undefined })

    // ignore non-panda css file
    if (!builder.isValidRoot(root)) return

    await builder.emit()

    builder.extract()

    builder.registerDependency((dep) => {
      result.messages.push({
        ...dep,
        plugin: PLUGIN_NAME,
        parent: result.opts.from,
      })
    })
    // console.log('postcss thing', root)

    builder.write(root)
    console.log('css builder files', builder.context?.getFiles())
    // builder.context?.createUtility(root)
    // const sheet = builder.context?.createSheet()
    // const css = builder.context?.getCss(sheet);

    // console.log('css' ,css);

    root.walk((node) => {
      if (!node.source) {
        node.source = root.source
      }
    })
  }

  return {
    postcssPlugin: PLUGIN_NAME,
    plugins: [
      // async (root) => {
      //   await builder.emit();
      //   builder.extract();
      //   builder.write(root);
      //   console.log('classnames', builder.context?.utility.classNames)

      // },

      function (...args) {
        builderGuard = Promise.resolve(builderGuard)
          .catch(() => {
            /**/
          })
          .then(() => postcssProcess(...args))
        return builderGuard
      },
    ],
  }
};

export default defineConfig({
  plugins: [
    react(), 
    // myPlugin()
  ],
  css: {
    // postcss: {
      // plugins: [postcssPlugin()],
    // },
  },
});
const nodeModulesRegex = /node_modules/

function isValidCss(file: string) {
  const [filePath] = file.split('?')
  return path.extname(filePath) === '.css'
}

const shouldSkip = (fileName: string | undefined) => {
  if (!fileName) return true
  if (!isValidCss(fileName)) return true
  return nodeModulesRegex.test(fileName)
}

postcssPlugin.postcss = true;

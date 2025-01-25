# Panda Vite plugin Proof of Concept

The panda CLI is very fast, but the startup time can be slow with very many files, and it checks every file for CSS, not just files that get imported. In a very large monorepo, it would be cumbersome to keep track of which files should be scanned for panda usage.

This plugin solves both of those issues by using a vite plugin and doing Panda processing in a Vite hook - only when the files are transformed by Vite (and therefore only when the files are actually imported)

## Compare the Performance

Run `pnpm make-files` before doing any tests to generate a large amount of files, which will better show the difference in the approaches.

Run `pnpm dev:postcss` to see the basic postcss approach. The first load will take several seconds. HMR takes a few seconds when making a change to a file that Panda watches.

Run `pnpm dev:plugin` to see how things work with the plugin. Startup and HMR are both very quick.

Run `pnpm dev:cli` to use the CLI. This is the current recommended way. In a project this large, the startup time is over 10 seconds, but the HMR update time is pretty quick.

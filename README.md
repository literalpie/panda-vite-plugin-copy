# Panda Many Files Performance

This repo has a huge number of files to show how PandaCSS performance degrades with the number of files.

It is representative of the number of files in a private repo I work on.

## See the issue

Run `pnpm dev`. This takes about 30s on my machine, but that's expected.
Open the page in a browser and see how long it takes to load the page. For me, it was about 24 seconds. Vite reports the "extract" step takes 8.2-8.4 seconds on my M2 Pro Macbook Pro.
Making a change to text takes over 3 seconds (measured with a stopwatch since Vite doesn't report this)

Without the Panda PostCSS plugin the browser loads is instantly the first time and when making changes.

## Proof of Concept Vite Plugin

Since I think the slowdown cause is the overhead of the postcss plugin watching files, and Vite already does its own file watching, I think it could make sense to watch the TS files in a Vite plugin and only use the postcss plugin to output the results.

My basic attempt at this reduced the first page load slightly, and made HMR instant.

## Data

| Setup           | First Page Load | HMR (Change text in App.tsx) |
| --------------- | --------------- | ---------------------------- |
| No Panda        | Instant         | Instant                      |
| With Panda      | 24 seconds      | 3-4 seconds                  |
| POC Vite Plugin | 15 seconds      | instant seconds              |

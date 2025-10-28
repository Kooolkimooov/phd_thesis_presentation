# PhD Thesis Presentation

This repository hosts a Reveal.js presentation using a variety of plugins.

## Prerequisites

- Node.js LTS (>= 18).
- pnpm package manager (recommended):



```
winget install OpenJS.NodeJS.LTS
npm i -g pnpm
```

## Install dependencies

From the repository root:

```
pnpm install
```

This installs all runtime dependencies.

And a few dev tools for convenience.

## Run a local web server (optional)

You can open `presentation.html` directly in a browser, or run a simple static server on <http://localhost:42069/presentation.html>:

```
python -m http.server 42069
```
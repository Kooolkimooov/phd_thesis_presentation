# PhD Thesis Presentation

This repository hosts a Reveal.js presentation with charts and plugins. It now uses npm/pnpm packages instead of git submodules. The HTML references assets directly from `./node_modules/...`, so there is no mirroring or copying step.

## Prerequisites

- Node.js LTS (>= 18). On Windows, install from <https://nodejs.org> or via winget.
- pnpm package manager (recommended):

```powershell
# Install pnpm (if not installed)
corepack enable
corepack prepare pnpm@latest --activate
```

If corepack is unavailable, install pnpm globally:

```powershell
npm i -g pnpm
```

## Install dependencies

From the repository root:

```powershell
pnpm install
```

This installs the following runtime dependencies:

- `reveal.js` (presentation framework)
- `chart.js` (charts)
- `reveal.js-plugins` (Chart plugin, etc.)
- `reveal.js-relativenumber` (relative slide number + simplemenu CSS)

And a few dev tools for convenience.

## No copy/build step

Assets are loaded directly from `node_modules`. You only need to `pnpm install`. There is no `pnpm run build` required for the presentation to work.

## Run a local web server (optional)

You can open `presentation.html` directly in a browser, or run a simple static server on <http://localhost:8080>:

```powershell
pnpm start
```

## Editing and usage

- Main entry: `presentation.html`
- Reveal initialization and custom helpers: `init.js`
- Custom styles: `theme.css`
- Math macros: `macros.tex`
- Media assets: `media/`

When loading directly from `node_modules`, using a local server (see `pnpm start`) ensures consistent behavior across browsers.

## Troubleshooting

- If a plugin path changes in a future release, update the `<script>` and `<link>` tags in `presentation.html` accordingly.
- Ensure Node >= 18 as required by `reveal.js@5`.

## Migrating all submodules via npm

This repository originally included several git submodules under `vendor/`. They now map to npm packages (loaded directly from `./node_modules`) as follows:

- GitHub: `https://github.com/chartjs/Chart.js` → npm: `chart.js`
- GitHub: `https://github.com/sgratzl/chartjs-chart-boxplot` → npm: `@sgratzl/chartjs-chart-boxplot`
- GitHub: `https://github.com/hakimel/reveal.js` → npm: `reveal.js`
- GitHub: `https://github.com/rajgoel/reveal.js-plugins` → npm: `reveal.js-plugins` (only `chart/` needed)
- GitHub: `https://github.com/Martinomagnifico/reveal.js-relativenumber` → npm: `reveal.js-relativenumber`
- GitHub: `https://github.com/e-gor/Reveal.js-Title-Footer` → npm via GitHub: `reveal.js-title-footer` (loaded from `./node_modules/reveal.js-title-footer/plugin/title-footer/`)
- GitHub: `https://github.com/tpoindex/reveal-onetimer` → npm via GitHub: `reveal-onetimer` (loaded from `./node_modules/reveal-onetimer/`)

If suitable npm packages for the last two become available, add them to `package.json` and extend `scripts/copy-vendor.cjs` to mirror their assets into `vendor/`.

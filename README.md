# Fast React Pizza

React + Redux Toolkit single-page app for browsing a pizza menu, managing a cart, and placing orders against the public `react-fast-pizza` API. Built to practise modern React patterns, data loading with React Router data APIs, and Tailwind CSS styling.

## Features

- Menu fetched from `https://react-fast-pizza-api.jonas.io/api`.
- Cart management with quantity controls, item removal, and order summary.
- Order creation flow with form validation and optional geolocation-powered address lookup.
- Order tracking page with status updates and partial updates (PATCH).
- Responsive Tailwind UI components and route-aware layout.

## Tech Stack

- React 19, Vite 7, React Router 7 (`react-router`)
- Redux Toolkit + React Redux
- Tailwind CSS 4, PostCSS (`@tailwindcss/postcss`), Autoprefixer
- ESLint 9 (flat config), Prettier (with Tailwind plugin)
- Vitest 4 + React Testing Library

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0` (Vite 7 requirement)

## Getting Started

```bash
npm install
npm run dev     # start Vite dev server
npm run lint    # optional: lint all JS/JSX
npm run test    # run tests in watch mode
```

Open `http://localhost:5173` (default) to view the app. The geolocation lookup requires allowing browser location access and HTTPS in production.

## Scripts

- `npm run dev` - start Vite dev server.
- `npm run build` - create a production build in `dist/`.
- `npm run preview` - preview the production build locally.
- `npm run lint` - run ESLint checks.
- `npm run lint:fix` - auto-fix lint issues where possible.
- `npm run test` - run unit tests in watch mode.
- `npm run test:run` - run unit tests once (CI/local verification).

## Build & Deploy

```bash
npm run build   # outputs production assets into dist/
npm run preview # serve the build locally
npm run test:run # run unit tests once (CI/local verification)
```

For Netlify/Vercel deploys, publish the `dist/` directory (leave `dist/` ignored in git). Add a SPA redirect such as a `_redirects` file containing `/* /index.html 200` so client-side routes resolve correctly.

## Project Structure

- `src/features/` – domain-specific slices and UI (cart, menu, order, user).
- `src/services/` – API clients (`apiRestaurant.js`, `apiGeocoding.js`).
- `src/test/` – test setup and centralized unit tests (`src/test/unit`), covering reducers/selectors, route actions/loaders, API services, and key UI flows.
- `src/ui/` – shared layout and components.
- `src/utils/` – helper utilities.
- `src/store.js` – Redux store configuration.
- `vitest.config.js` – Vitest test runner configuration.

## External Services

- `react-fast-pizza` REST API (menu, order CRUD).
- BigDataCloud reverse geocoding API for address lookup.

Ensure network access to these endpoints; the app does not include offline mocks.

## Quality Checks

- ESLint 9 flat config with React, hooks, refresh, and import-order rules.
- Vitest 4 + React Testing Library for centralized unit tests.
- `npm run build` verifies production bundling.

## License

Built while following the Udemy course **“The Ultimate React Course” by Jonas Schmedtmann**. All course credit belongs to the instructor; this repository is shared solely for personal learning and portfolio purposes.

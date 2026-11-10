# Fast React Pizza

A responsive pizza-ordering demo. Browse the menu, manage your cart, place a demo order and track its status.

[Hosted demo](https://fast-react-pizza-vdrenkov.netlify.app/)

## Features

- Responsive menu with high-resolution images, sold-out states and cart quantity controls.
- Validated checkout, optional location lookup and a 20% priority surcharge.
- Order lookup, delivery estimates, status refresh and priority upgrades.
- Recoverable network errors, keyboard navigation and reduced-motion support.

## Stack

React 19 · React Router 8 · Redux Toolkit 2 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · Zod 4.

## Run locally

Use **Node.js 26.13.0** from `.nvmrc` and **npm 12.2.2**.

```bash
npm install --global npm@12.2.2
npm ci
npm run dev
```

Open the URL printed by Vite. For a production preview, run `npm run build` followed by `npm run preview`.

## Verification

```bash
npm run check
npm audit --audit-level=low
```

`check` runs formatting, the strict TypeScript/Vite build and Vitest tests. Vitest and Testing Library cover state, API contracts, validation, responsive image sources and component flows using controlled API responses.

GitHub Actions runs the same checks on pushes and pull requests.

## Demo boundaries

Orders go to a public [teaching API](https://react-fast-pizza-api.jonas.io/api/menu). Use fictional contact details. There is no authentication, payment processing or real delivery.

Cart and customer details reset on page reload; keep the order number to retrieve an order. Optional location lookup shares your coordinates with BigDataCloud after you select **Use my location**. Review the suggested area and enter a full street address before submitting.

## Acknowledgments

Based on **The Ultimate React Course** by Jonas Schmedtmann. The pizza images are AI-generated. This is a personal portfolio project and is not for redistribution.

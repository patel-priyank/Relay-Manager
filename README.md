# Relay Manager

A web application for managing your [Firefox Relay](https://relay.firefox.com) email aliases. View, create, update, and delete aliases, control blocking levels, and track email statistics, all from a clean, polished interface.

> **Disclaimer:** Relay Manager is an independent, community-built tool and is not affiliated with, endorsed by, or related to Mozilla or Firefox in any way.

## Features

- **View all aliases:** Random and custom (domain) aliases in one place.
- **Create aliases:** Random aliases for all users, custom aliases for Premium subscribers.
- **Labels:** Add and edit labels for each alias inline.
- **Blocking levels:** Set per-alias blocking to None, Promotions (Premium only), or All.
- **Search, sort, and filter:** Find aliases by label or address, sort by various criteria, filter by type and blocking level.
- **Statistics:** View per-alias email counts (forwarded, blocked, replied, trackers blocked).
- **Account overview:** See your total email stats and subscription status.
- **Light/dark/system theme:** Respects your system preference by default.
- **No data collection:** Your API key is stored only in your browser's local storage and is only ever sent to Firefox Relay's API.

## Architecture

The project has two parts:

```
relay-manager/
├── api/        # Express proxy server (Node.js + TypeScript)
└── webapp/     # Angular frontend
```

The **Express API** acts as a proxy between the Angular app and the Firefox Relay REST API (`https://relay.firefox.com/api/v1/`). This keeps CORS out of the picture and avoids exposing the Firefox Relay API directly to the browser.

The **Angular webapp** is a standalone SPA using PrimeNG for UI components and Tailwind CSS for layout.

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+

### 1. Clone the repository

```bash
git clone https://github.com/patel-priyank/Relay-Manager.git
cd Relay-Manager
```

### 2. Start the API server

```bash
cd api
cp .env.example .env
npm install
npm run dev
```

The API server starts on `http://localhost:4000`.

### 3. Start the webapp

```bash
cd webapp
npm install
npm start
```

The app opens at `http://localhost:4200`. The Angular dev server proxies `/api` requests to `http://localhost:4000` automatically.

### 4. Connect

1. Go to [https://relay.firefox.com/accounts/settings](https://relay.firefox.com/accounts/settings/) and copy your API key
2. Paste it into Relay Manager and click **Connect**

Your API key is stored in `localStorage` and never leaves your browser except as an auth token in requests to the proxy.

## Deploying

The `api` and `webapp` are deployed separately. Deploy the API server first so you have its URL ready for the webapp build.

### API server

The API is a standard Node.js Express app. It can be hosted on any platform that supports Node.js (e.g. Vercel, Railway, Render, Fly.io).

Set the following environment variable on your host:

| Variable | Description                |
| -------- | -------------------------- |
| `PORT`   | Port the server listens on |

### Webapp

The webapp builds to a static SPA and can be hosted on any static hosting platform (e.g. Vercel, Netlify, Cloudflare Pages).

Set the following environment variable before building:

| Variable  | Description                                                            |
| --------- | ---------------------------------------------------------------------- |
| `API_URL` | Full URL of your deployed API server (e.g. `https://your-api-url.com`) |

Then build and deploy the output:

```bash
cd webapp
npm run build
# deploy the dist/ folder
```

If `API_URL` is not set, the app falls back to relative `/api` paths, which is suitable for local development.

## Tech stack

| Layer              | Technology                          |
| ------------------ | ----------------------------------- |
| Frontend framework | Angular 21                          |
| UI components      | PrimeNG 21                          |
| Icons              | Phosphor Icons                      |
| Styling            | Tailwind CSS (browser build) + SCSS |
| API proxy          | Express 5 + TypeScript              |
| Hosting (webapp)   | Vercel                              |

## Privacy

- Your API key is stored in `localStorage` in your own browser only
- No analytics, tracking, or telemetry of any kind
- No data is stored or logged server-side beyond standard request logs
- The proxy server exists solely to forward your requests to Firefox Relay's API

## Contributing

Issues and pull requests are welcome. Please open an issue first for significant changes.

## License

MIT

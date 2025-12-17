# Stuff Control

Full‑stack inventory tracker built with React/Vite on the client and Go + PostgreSQL on the server.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 18+ | Vite and the dev server expect a modern runtime |
| Yarn | 4.5.2 | Already configured via `packageManager`; run `corepack enable` if needed |
| Go | 1.22+ | Required for the API server located in `server/` |
| PostgreSQL | 14+ | The Go service applies migrations automatically on startup |

## Environment Variables

### Frontend (`.env` / `.env.local`)

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_SERVER_ORIGIN` | Base URL the SPA uses when talking to the Go server. Set to the public HTTP endpoint if the API is remote. | `http://localhost:3000` (configured in `vite.config.ts`) |

### Backend (`server/.env` or shell)

| Variable | Description | Default in development |
| --- | --- | --- |
| `NODE_ENV` | `development`, `test`, or `production`. Affects DB defaults. | `development` |
| `PORT` | HTTP port for the Go server. | `3000` |
| `DB_HOST` | PostgreSQL host. | `localhost` |
| `DB_PORT` | PostgreSQL port. | `5432` |
| `DB_USER` | Database user. | `stuffcontrol_user` |
| `DB_PASSWORD` | Database password. | `stuffcontrol_password` |
| `DB_NAME` | Database name. | `stuffcontrol_development` |
| `DB_SSL_MODE` | Postgres SSL mode (`disable`, `require`, etc.). | `disable` |

> The server also checks `RENDER`; when set, it binds to `0.0.0.0`.

## Installation

1. **Install dependencies**
   ```bash
   yarn install
   ```
2. **Prepare the database**
   ```bash
   createdb stuffcontrol_development
   # or adjust according to the env vars you configured
   ```
3. (Optional) create `.env.local` and `.env` files for the frontend and backend respectively to override any defaults listed above.

## Running the stack locally

### Backend API

```bash
yarn server:start
# or manually:
# cd server && go run ./cmd/server
```

The server connects to PostgreSQL, runs migrations from `server/migrations`, and then listens on `http://localhost:3000` unless overridden by env variables.

### Frontend (Vite dev server)

```bash
yarn dev
```

By default the SPA is served at `http://localhost:5173`. It proxies API calls to `VITE_SERVER_ORIGIN`, so ensure that variable points to the backend instance you started above.

## Building & Previewing

```bash
yarn build   # type-check + bundle client
yarn preview # serves the production build locally
```

## Useful Scripts

| Command | Description |
| --- | --- |
| `yarn lint` | Run ESLint on the frontend |
| `yarn server:deps` | Sync Go module dependencies (`go mod tidy`) |
| `yarn server:start` | Start the Go API (as described earlier) |

## Folder Layout

```
src/          – React application
server/       – Go API, migrations, configuration
public/       – Static assets served by Vite
```

Everything else (Go migrations, API handlers, etc.) lives inside `server/` and is documented inline.

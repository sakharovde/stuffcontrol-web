# Stuff Control

Full-stack inventory tracker built with React/Vite on the client and a TypeScript/Fastify + TypeORM server in `server/`.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 22+ | Required for both the frontend and the backend |
| Yarn | 4.5.2 | Enabled via `packageManager`; run `corepack enable` if needed |
| PostgreSQL | 14+ | Required by the backend in `server/` |

## Environment Variables

### Frontend (`.env` / `.env.local`)

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_SERVER_ORIGIN` | Base URL used by the SPA for API calls. | `http://localhost:3000` |

### Backend (`server/.env` or shell)

| Variable | Description | Default in development |
| --- | --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` | `development` |
| `PORT` | HTTP port for the backend | `3000` |
| `STATIC_DIR` | Directory with built frontend assets served by Fastify | `../dist` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `stuffcontrol_user` |
| `DB_PASSWORD` | Database password | `stuffcontrol_password` |
| `DB_NAME` | Database name | `stuffcontrol_development` |

## Installation

```bash
yarn install
yarn server:deps
```

Create the development database if needed:

```bash
createdb stuffcontrol_development
```

## Running locally

Start the backend:

```bash
yarn server:start
```

The backend serves API routes and, when `dist/` exists, also serves the built SPA from `http://localhost:3000`.

Start the Vite dev server separately when working on the frontend:

```bash
yarn dev
```

## Build and test

```bash
yarn build
yarn server:build
yarn server:test
```

## Useful scripts

| Command | Description |
| --- | --- |
| `yarn lint` | Run frontend ESLint |
| `yarn server:deps` | Install backend dependencies in `server/` |
| `yarn server:build` | Compile the backend TypeScript server |
| `yarn server:test` | Run backend Vitest/e2e suite |
| `yarn server:start` | Build and start the backend server |

## Folder layout

```text
src/          React application
dist/         Built frontend bundle
server/       TypeScript Fastify server
public/       Frontend public assets
```

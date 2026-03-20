# Stuff Control

Yarn workspace monorepo for the Stuff Control web app.

## Structure

```text
apps/client   React + Vite frontend
apps/server   Fastify + TypeORM backend
packages/     Shared packages placeholder
dist/         Production frontend bundle
```

## Prerequisites

- Node.js 22+
- Yarn 4.5.2
- PostgreSQL 14+

## Install

```bash
corepack enable
yarn install
```

## Common commands

```bash
yarn dev
yarn build
yarn lint
yarn test

yarn server:build
yarn server:test
yarn server:start
```

`yarn build` builds the client into `dist/`.
`yarn server:start` builds and starts the backend from `apps/server`, which serves both API routes and the built SPA from `dist/`.

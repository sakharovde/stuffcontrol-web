# stuff-control-server

TypeScript/Fastify backend for Stuff Control.

## Prerequisites

- Node.js 22+
- Yarn 4.5.2
- PostgreSQL 14+

## Useful commands

```bash
yarn install
yarn build
yarn start
yarn vitest run
```

The server exposes the API routes from the original `../server` project and also serves the built SPA when `STATIC_DIR` points to a frontend build directory. By default it uses `../dist`.

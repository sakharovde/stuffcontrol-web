import fs from 'node:fs';
import path from 'node:path';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import registrationHandler from './auth/handlers/registration';
import verifyRegistrationHandler from './auth/handlers/verifyRegistration';
import authenticationHandler from './auth/handlers/authentication';
import verifyAuthenticationHandler from './auth/handlers/verifyAuthentication';
import createSyncSessionHandler from './sync-sessions/handlers/create';
import allStorageEventsHandler from './storage-events/handlers/all';
import allSyncSessionsHandler from './sync-sessions/handlers/all';
import allProductsHandler from './products/handlers/all';
import allBatchesHandler from './batches/handlers/all';
import allStoragesHandler from './storages/handlers/all';
import { config } from '../config';

const server = fastify({
  logger: process.env.NODE_ENV !== 'test',
});

server.register(fastifyCors);

server.route({
  method: 'GET',
  url: '/ping',
  handler: async () => {
    return 'pong\n';
  },
});

// registration
server
  .route({
    method: 'POST',
    url: '/api/register',
    handler: registrationHandler,
  })
  .route({
    method: 'POST',
    url: '/api/register/verify',
    handler: verifyRegistrationHandler,
  });

// authentication
server
  .route({
    method: 'POST',
    url: '/api/authenticate',
    handler: authenticationHandler,
  })
  .route({
    method: 'POST',
    url: '/api/authenticate/verify',
    handler: verifyAuthenticationHandler,
  });

// storage events
server.route({
  method: 'GET',
  url: '/api/storage-events',
  handler: allStorageEventsHandler,
});

// products
server.route({
  method: 'GET',
  url: '/api/products',
  handler: allProductsHandler,
});

// batches
server.route({
  method: 'GET',
  url: '/api/batches',
  handler: allBatchesHandler,
});

// storages
server.route({
  method: 'GET',
  url: '/api/storages',
  handler: allStoragesHandler,
});

// sync sessions
server
  .route({
    method: 'GET',
    url: '/api/sync-sessions',
    handler: allSyncSessionsHandler,
  })
  .route({
    method: 'POST',
    url: '/api/sync-sessions',
    handler: createSyncSessionHandler,
  })
  .route({
    method: 'POST',
    url: '/api/sync-session',
    handler: createSyncSessionHandler,
  });

const staticDir = config.server.staticDir;

if (fs.existsSync(staticDir)) {
  server.register(fastifyStatic, {
    root: staticDir,
    decorateReply: false,
    wildcard: false,
  });

  server.get('/*', async (request, reply) => {
    const requestPath = request.url.split('?')[0];

    if (requestPath.startsWith('/api/')) {
      return reply.callNotFound();
    }

    const relativePath =
      requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const absolutePath = path.join(staticDir, relativePath);

    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
      return reply.sendFile(relativePath);
    }

    return reply.sendFile('index.html');
  });
}

export default server;

process.env.NODE_ENV = 'test';

import type { FastifyInstance } from 'fastify';
import app from '../app/server';
import dataSource from '../db/data-source';

let appPromise: Promise<FastifyInstance> | null = null;

export const getTestApp = async (): Promise<FastifyInstance> => {
  if (!appPromise) {
    appPromise = (async () => {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }

      await app.ready();
      return app;
    })();
  }

  return appPromise;
};

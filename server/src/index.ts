import 'dotenv/config';
import server from './app/server';
import { config } from './config';
import DBDataSource from './db/data-source';

const bootstrap = async () => {
  try {
    await DBDataSource.initialize();
    console.log('Connected to the database');

    const address = await server.listen({
      host: config.server.host,
      port: config.server.port,
    });

    console.log(`Server listening at ${address}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void bootstrap();

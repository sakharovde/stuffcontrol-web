import path from 'node:path';

type NodeEnv = 'development' | 'test' | 'production';

const getNodeEnv = (): NodeEnv => {
  if(!process.env.NODE_ENV) {
    return 'development'
  }
  
  if(process.env.NODE_ENV === 'test') {
    return 'test';
  }

  if(process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  return 'development'
}

type Config = {
  server: {
    port: number;
    host: string;
    staticDir: string;
  };
  db: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    name?: string;
    logging?: boolean;
  }
};

const fullConfig: Record<NodeEnv, Config> = {
  development: {
    server: {
      port: Number(process.env.PORT || 3000),
      host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
      staticDir: path.resolve(process.cwd(), process.env.STATIC_DIR || '../../dist'),
    },
    db: {
      host: 'localhost',
      port: 5432,
      user: 'stuffcontrol_user',
      password: 'stuffcontrol_password',
      name: 'stuffcontrol_development',
      logging: true,
    },
  },
  test: {
    server: {
      port: Number(process.env.PORT || 3000),
      host: '127.0.0.1',
      staticDir: path.resolve(process.cwd(), process.env.STATIC_DIR || '../../dist'),
    },
    db: {
      host: 'localhost',
      port: 5432,
      user: 'stuffcontrol_user',
      password: 'stuffcontrol_password',
      name: 'stuffcontrol_test',
      logging: false,
    },
  },
  production: {
    server: {
      port: Number(process.env.PORT || 3000),
      host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
      staticDir: path.resolve(process.cwd(), process.env.STATIC_DIR || '../../dist'),
    },
    db: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
      logging: true,
    },
  },
};

export const config = fullConfig[getNodeEnv()];

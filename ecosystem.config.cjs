module.exports = {
  apps: [
    {
      name: 'Vite',
      script: 'yarn vite',
    },
    {
      name: 'TypesScript',
      script: 'yarn tsc --noEmit --watch --preserveWatchOutput --skipLibCheck --project tsconfig.app.json',
    },
    {
      name: 'Server',
      script: 'yarn build && yarn start',
      cwd: '../stuff-control-server',
    },
  ],
};

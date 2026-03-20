import { getTestApp } from '../../test-server';

export const getStorageList = () => {
  return getTestApp().then((app) =>
    app.inject({
      method: 'GET',
      url: '/api/storages',
    })
  );
};

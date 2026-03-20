import { getTestApp } from '../../test-server';

export const getBatchList = () => {
  return getTestApp().then((app) =>
    app.inject({
      method: 'GET',
      url: '/api/batches',
    })
  );
};

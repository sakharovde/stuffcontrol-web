import { getTestApp } from '../../test-server';

export const getProductList = () => {
  return getTestApp().then((app) =>
    app.inject({
      method: 'GET',
      url: '/api/products',
    })
  );
};

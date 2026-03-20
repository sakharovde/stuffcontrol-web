import { getTestApp } from './test-server';
import { faker } from '@faker-js/faker';

describe('Sync Sessions', () => {
  it('should return 400 when event list is empty', async () => {
    const app = await getTestApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/sync-session',
      body: { sessionId: faker.string.uuid(), events: [] },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      message: 'At least one event must be provided',
    });
  });

  it('should support the plural sync sessions route used by the web app', async () => {
    const app = await getTestApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/sync-sessions',
      body: { storageId: faker.string.uuid(), events: [] },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      message: 'At least one event must be provided',
    });
  });
});

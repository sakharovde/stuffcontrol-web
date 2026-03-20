import { dto } from '../dto';
import { getTestApp } from '../../test-server';

type Event = ReturnType<
  | typeof dto.events.createStorage
  | typeof dto.events.changeStorageName
  | typeof dto.events.addProducts
  | typeof dto.events.removeProducts
  | typeof dto.events.changeProductName
  | typeof dto.events.deleteStorage
>;

export const createSyncSession = (args: {
  storageId: string;
  events: Event[];
}) => {
  return getTestApp().then((app) =>
    app.inject({
      method: 'POST',
      url: '/api/sync-session',
      body: {
        storageId: args.storageId,
        events: args.events,
      },
    })
  );
};

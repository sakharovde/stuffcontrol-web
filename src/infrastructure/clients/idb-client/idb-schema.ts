import { DBSchema } from 'idb';
import { IdbTransaction, IdbSyncSession } from './idb-types.ts';

export interface StuffControlDBSchema1 extends DBSchema {
  transactions: {
    key: IdbTransaction['id']; // event.id
    value: IdbTransaction;
    indexes: {
      'by-storageId': string;
      'by-productId': string;
      'by-batchId': string;
      'by-syncSessionId': string;
      'by-createdAt': string;
    };
  };
  syncSessions: {
    key: IdbSyncSession['id'];
    value: IdbSyncSession;
    indexes: {
      'by-storageId': string;
      'by-createdAt': string;
    };
  };
}

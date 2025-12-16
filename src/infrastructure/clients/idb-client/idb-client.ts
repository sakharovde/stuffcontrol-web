import { openDB } from 'idb';
import { StuffControlDBSchema1 } from './idb-schema.ts';
import { IdbTransaction, IdbSyncSession } from './idb-types.ts';

export default class IdbClient {
  private readonly dbPromise = openDB<StuffControlDBSchema1>('stuff-control-db', 1, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const eventStore = db.createObjectStore('transactions', { keyPath: 'id' });
        eventStore.createIndex('by-storageId', 'storageId');
        eventStore.createIndex('by-productId', 'productId');
        eventStore.createIndex('by-batchId', 'batchId');
        eventStore.createIndex('by-syncSession', 'syncSession');
        eventStore.createIndex('by-createdAt', 'createdAt');

        const syncStore = db.createObjectStore('syncSessions', { keyPath: 'id' });
        syncStore.createIndex('by-storageId', 'storageId');
        syncStore.createIndex('by-createdAt', 'createdAt');
      }
    },
  });

  getAllTransactions = async (): Promise<IdbTransaction[]> => {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    return store.getAll();
  };

  getAllTransactionWithStorageId = async (): Promise<IdbTransaction[]> => {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const index = store.index('by-storageId');
    return index.getAll();
  };

  getAllTransactionsWithStorageName = async (): Promise<IdbTransaction[]> => {
    const allTransactions = await this.getAllTransactionWithStorageId();
    return allTransactions.filter((transaction) => !!transaction.data.storageName);
  };

  getLastSyncSession = async (): Promise<IdbSyncSession | null> => {
    const db = await this.dbPromise;
    const tx = db.transaction('syncSessions', 'readonly');
    const store = tx.objectStore('syncSessions');
    const index = store.index('by-createdAt');
    const cursor = await index.openCursor(null, 'prev');
    return cursor?.value || null;
  };

  getEventsWithoutSyncSession = async (): Promise<IdbTransaction[]> => {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const index = store.index('by-syncSession');
    return index.getAll(null);
  };

  getLastTransactionByStorageIdWithStorageName = async (storageId: string): Promise<IdbTransaction | null> => {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const index = store.index('by-storageId');
    let cursor = await index.openCursor(storageId, 'prev');

    while (cursor) {
      if (cursor.value?.data?.storageName) {
        return cursor.value;
      }
      cursor = await cursor.continue();
    }

    return null;
  };

  createTransaction = async (transaction: IdbTransaction): Promise<void> => {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    await store.add(transaction);
    await tx.done;
  };

  updateTransaction = async (transaction: IdbTransaction): Promise<void> => {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    await store.put(transaction);
    await tx.done;
  };

  deleteTransaction = async (transactionId: IdbTransaction['id']): Promise<void> => {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    await store.delete(transactionId);
    await tx.done;
  };

  saveSyncSession = async (session: IdbSyncSession): Promise<void> => {
    const db = await this.dbPromise;
    const tx = db.transaction('syncSessions', 'readwrite');
    const store = tx.objectStore('syncSessions');
    await store.put(session);
    await tx.done;
  };
}

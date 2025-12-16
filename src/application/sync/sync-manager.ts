import { v7 as uuidv7 } from 'uuid';
import IdbClient from '../../infrastructure/clients/idb-client/idb-client.ts';
import { IdbSyncSession, IdbTransaction } from '../../infrastructure/clients/idb-client/idb-types.ts';
import HttpClient from '../../infrastructure/clients/http-client/http-client.ts';
import { HttpSyncEvent, HttpSyncRequest, HttpSyncSession } from '../../infrastructure/clients/http-client/http-types.ts';

type SyncStats = {
  storages: number;
  transactions: number;
};

export default class SyncManager {
  constructor(
    private readonly idbClient: IdbClient,
    private readonly httpClient: HttpClient
  ) {}

  public readonly syncPendingTransactions = async (): Promise<SyncStats> => {
    const unsyncedTransactions = await this.idbClient.getEventsWithoutSyncSession();

    if (!unsyncedTransactions.length) {
      return { storages: 0, transactions: 0 };
    }

    const groupedByStorage = this.groupTransactionsByStorage(unsyncedTransactions);
    let syncedTransactions = 0;

    for (const [storageId, transactions] of groupedByStorage.entries()) {
      const orderedTransactions = [...transactions].sort((a, b) => a.createdAt - b.createdAt);

      const payload: HttpSyncRequest = {
        storageId,
        events: orderedTransactions.map((transaction) => this.mapTransactionToSyncEvent(transaction)),
      };

      const session = await this.httpClient.createSyncSession(payload);
      const syncSessionId = session?.id ?? uuidv7();

      await Promise.all(
        orderedTransactions.map((transaction) =>
          this.idbClient.updateTransaction({
            ...transaction,
            syncSessionId,
          })
        )
      );

      await this.idbClient.saveSyncSession(
        session ? this.mapHttpSessionToIdb(session) : this.buildPlaceholderSession(syncSessionId, storageId)
      );

      syncedTransactions += orderedTransactions.length;
    }

    return { storages: groupedByStorage.size, transactions: syncedTransactions };
  };

  private groupTransactionsByStorage(transactions: IdbTransaction[]): Map<string, IdbTransaction[]> {
    return transactions.reduce((acc, transaction) => {
      const next = acc.get(transaction.storageId) ?? [];
      next.push(transaction);
      acc.set(transaction.storageId, next);
      return acc;
    }, new Map<string, IdbTransaction[]>());
  }

  private mapTransactionToSyncEvent(transaction: IdbTransaction): HttpSyncEvent {
    const toISOString = (timestamp?: number) =>
      typeof timestamp === 'number' ? new Date(timestamp).toISOString() : undefined;

    return {
      productId: transaction.productId ?? '',
      batchId: transaction.batchId ?? '',
      eventType: transaction.eventType,
      quantity: transaction.data.quantity,
      productName: transaction.data.productName,
      storageName: transaction.data.storageName,
      expiryDate: toISOString(transaction.data.expiryDate),
      manufactureDate: toISOString(transaction.data.manufactureDate),
      shelfLifeDays: transaction.data.shelfLifeDays,
    };
  }

  private mapHttpSessionToIdb(session: HttpSyncSession): IdbSyncSession {
    const optional = <T>(value: T | null | undefined) => (value == null ? undefined : value);

    return {
      id: session.id,
      storageId: session.storageId,
      snapshot: session.snapshot.map((item) => ({
        storageId: item.storageId,
        productId: item.productId,
        batchId: item.batchId,
        productName: item.productName,
        quantity: item.quantity,
        expiryDate: optional(item.expiryDate),
        manufactureDate: optional(item.manufactureDate),
        shelfLifeDays: optional(item.shelfLifeDays),
      })),
      createdAt: new Date(session.createdAt).getTime(),
    };
  }

  private buildPlaceholderSession(id: string, storageId: string): IdbSyncSession {
    return {
      id,
      storageId,
      snapshot: [],
      createdAt: Date.now(),
    };
  }
}

import { v7 as uuidv7 } from 'uuid';
import IdbClient from '../../infrastructure/clients/idb-client/idb-client.ts';
import { IdbSyncSession, IdbTransaction } from '../../infrastructure/clients/idb-client/idb-types.ts';
import HttpClient from '../../infrastructure/clients/http-client/http-client.ts';
import {
  HttpSyncEvent,
  HttpSyncRequest,
  HttpSyncSession,
} from '../../infrastructure/clients/http-client/http-types.ts';

type SyncStats = {
  storages: number;
  transactions: number;
};

export type PendingBatchChange = {
  batchId: string;
  deltaQuantity: number;
  hasRename: boolean;
};

export type PendingStorageChanges = {
  storageId: string;
  pendingEvents: number;
  totalDelta: number;
  hasStorageChanges: boolean;
  batches: Record<string, PendingBatchChange>;
};

export default class SyncManager {
  constructor(
    private readonly idbClient: IdbClient,
    private readonly httpClient: HttpClient
  ) {}

  public readonly syncPendingTransactions = async (storageId?: string): Promise<SyncStats> => {
    const unsyncedTransactions = await this.idbClient.getEventsWithoutSyncSession();
    const relevantTransactions = storageId
      ? unsyncedTransactions.filter((transaction) => transaction.storageId === storageId)
      : unsyncedTransactions;

    if (!relevantTransactions.length) {
      return { storages: 0, transactions: 0 };
    }

    const groupedByStorage = storageId
      ? new Map([[storageId, relevantTransactions]])
      : this.groupTransactionsByStorage(relevantTransactions);
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

  public readonly getPendingChanges = async (): Promise<Map<string, PendingStorageChanges>> => {
    const pendingTransactions = await this.idbClient.getEventsWithoutSyncSession();
    const changes = new Map<string, PendingStorageChanges>();

    for (const transaction of pendingTransactions) {
      const storageChange = this.ensureStorageChange(changes, transaction.storageId);
      storageChange.pendingEvents += 1;

      switch (transaction.eventType) {
        case 'addProducts': {
          const quantity = transaction.data.quantity ?? 0;
          storageChange.totalDelta += quantity;
          this.applyBatchDelta(storageChange, transaction, quantity);
          break;
        }
        case 'removeProducts': {
          const quantity = transaction.data.quantity ?? 0;
          storageChange.totalDelta -= quantity;
          this.applyBatchDelta(storageChange, transaction, -quantity);
          break;
        }
        case 'changeProductName':
          this.markBatchRename(storageChange, transaction);
          break;
        case 'createStorage':
        case 'changeStorageName':
        case 'deleteStorage':
          storageChange.hasStorageChanges = true;
          break;
      }

      changes.set(transaction.storageId, storageChange);
    }

    return changes;
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

  private ensureStorageChange(
    changes: Map<string, PendingStorageChanges>,
    storageId: string
  ): PendingStorageChanges {
    if (!changes.has(storageId)) {
      changes.set(storageId, {
        storageId,
        pendingEvents: 0,
        totalDelta: 0,
        hasStorageChanges: false,
        batches: {},
      });
    }

    return changes.get(storageId)!;
  }

  private applyBatchDelta(
    storageChange: PendingStorageChanges,
    transaction: IdbTransaction,
    delta: number
  ) {
    const batchId = transaction.batchId ?? transaction.productId;
    if (!batchId) {
      return;
    }

    const batchChange =
      storageChange.batches[batchId] ??
      (storageChange.batches[batchId] = { batchId, deltaQuantity: 0, hasRename: false });

    batchChange.deltaQuantity += delta;
  }

  private markBatchRename(storageChange: PendingStorageChanges, transaction: IdbTransaction) {
    const batchId = transaction.batchId ?? transaction.productId;
    if (!batchId) {
      return;
    }

    const batchChange =
      storageChange.batches[batchId] ??
      (storageChange.batches[batchId] = { batchId, deltaQuantity: 0, hasRename: false });

    batchChange.hasRename = true;
  }

  public readonly discardPendingTransactions = async (storageId: string): Promise<void> => {
    const pendingTransactions = await this.idbClient.getEventsWithoutSyncSession();
    await Promise.all(
      pendingTransactions
        .filter((transaction) => transaction.storageId === storageId)
        .map((transaction) => this.idbClient.deleteTransaction(transaction.id))
    );
  };
}

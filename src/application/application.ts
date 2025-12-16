import { HttpClient, ProductRepositoryImpl, StorageRepositoryImpl } from '../infrastructure';
import BatchRepositoryImpl from '../infrastructure/repositories/batch-repository.ts';
import StorageManager from './storage/storage-manager.ts';
import IdbClient from '../infrastructure/clients/idb-client/idb-client.ts';
import TransactionService from '../domain/services/transaction-service.ts';
import SyncManager from './sync/sync-manager.ts';
import BatchManager from './storage/batch-manager.ts';

export default class Application {
  private readonly clients = {
    idbClient: new IdbClient(),
    httpClient: new HttpClient(),
  };

  private readonly services = {
    transactionService: new TransactionService(),
  };

  private readonly repositories = {
    storage: new StorageRepositoryImpl(this.clients.idbClient, this.services.transactionService),
    product: new ProductRepositoryImpl(this.clients.idbClient, this.services.transactionService),
    batch: new BatchRepositoryImpl(this.clients.idbClient, this.services.transactionService),
  };

  private batchManager: BatchManager | null = null;
  private storageManager: StorageManager | null = null;
  private syncManager: SyncManager | null = null;

  public readonly getBatchManager = (): BatchManager => {
    if (!this.batchManager) {
      this.batchManager = new BatchManager(this.repositories.batch);
    }

    return this.batchManager;
  };

  public readonly getStorageManager = (): StorageManager => {
    if (!this.storageManager) {
      this.storageManager = new StorageManager(this.repositories.storage);
    }

    return this.storageManager;
  };

  public readonly getSyncManager = (): SyncManager => {
    if (!this.syncManager) {
      this.syncManager = new SyncManager(this.clients.idbClient, this.clients.httpClient);
    }

    return this.syncManager;
  };

  public readonly syncPendingTransactions = () => {
    return this.getSyncManager().syncPendingTransactions();
  };
}

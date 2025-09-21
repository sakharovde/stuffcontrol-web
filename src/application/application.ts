import { ProductRepositoryImpl, StorageRepositoryImpl } from '../infrastructure';

import BatchRepositoryImpl from '../infrastructure/repositories/batch-repository.ts';
import StorageManager from './storage/storage-manager.ts';
import IdbClient from '../infrastructure/clients/idb-client/idb-client.ts';
import TransactionService from '../domain/services/transaction-service.ts';

export default class Application {
  private readonly clients = {
    idbClient: new IdbClient(),
  };

  private readonly services = {
    transactionService: TransactionService,
  };

  private readonly repositories = {
    storage: new StorageRepositoryImpl(this.clients.idbClient, this.services.transactionService),
    product: new ProductRepositoryImpl(),
    batch: new BatchRepositoryImpl(),
  };

  private storageManager: StorageManager | null = null;

  public readonly getStorageManager = (): StorageManager => {
    if (!this.storageManager) {
      this.storageManager = new StorageManager(this.repositories.storage);
    }

    return this.storageManager;
  };
}

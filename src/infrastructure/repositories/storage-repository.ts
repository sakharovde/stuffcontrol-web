import { Storage, StorageRepository } from '../../domain';
import StorageMapper from '../mappers/storage.ts';
import IdbClient from '../clients/idb-client/idb-client.ts';
import TransactionService from '../../domain/mappers/transaction-service.ts';
import ChangeStorageNameTransaction from '../../domain/entities/transactions/change-storage-name-transaction.ts';
import { v4 as uuidv4 } from 'uuid';
import CreateStorageTransaction from '../../domain/entities/transactions/create-storage-transaction.ts';
import TransactionMapper from '../mappers/transaction-mapper.ts';
import DeleteStorageTransaction from '../../domain/entities/transactions/delete-storage-transaction.ts';

export default class StorageRepositoryImpl implements StorageRepository {
  constructor(
    private readonly idbClient: IdbClient,
    private readonly transactionService: TransactionService
  ) {}

  async findById(id: Storage['id']): Promise<Storage | null> {
    const transaction = await this.idbClient.getLastTransactionByStorageIdWithStorageName(id);

    if (!transaction) {
      return null;
    }

    return StorageMapper.toDomain({
      id: transaction.storageId,
      name: transaction.data.storageName,
    });
  }

  async save(storage: Storage): Promise<Storage> {
    const existing = await this.findById(storage.id);
    if (existing && existing.name === storage.name) {
      return storage;
    }

    if (existing) {
      await this.idbClient.createTransaction(
        TransactionMapper.toPersistence(
          this.transactionService.fromNamed(new ChangeStorageNameTransaction(uuidv4(), storage.id, storage.name))
        )
      );
    } else {
      await this.idbClient.createTransaction(
        TransactionMapper.toPersistence(
          this.transactionService.fromNamed(new CreateStorageTransaction(uuidv4(), storage.id, storage.name))
        )
      );
    }

    const createdStorage = await this.findById(storage.id);

    if (!createdStorage) {
      throw new Error('Failed to create storage');
    }

    return createdStorage;
  }

  async getAll(): Promise<Storage[]> {
    const allTransactions = await this.idbClient.getAllTransactionsWithStorageName();
    const storageDataMap: Map<Storage['id'], { id: Storage['id']; name: string }> = new Map();

    allTransactions.forEach((transaction) => {
      if (
        !transaction.data.storageName ||
        transaction.eventType === 'deleteStorage' ||
        storageDataMap.has(transaction.storageId)
      ) {
        return;
      }

      storageDataMap.set(transaction.storageId, {
        id: transaction.storageId,
        name: transaction.data.storageName,
      });
    });

    allTransactions.forEach((transaction) => {
      if (transaction.eventType === 'deleteStorage') {
        storageDataMap.delete(transaction.storageId);
      }
    });

    return Array.from(storageDataMap.values()).map((data) => StorageMapper.toDomain(data));
  }

  remove = async (id: Storage['id']): Promise<void> => {
    await this.idbClient.createTransaction(
      TransactionMapper.toPersistence(this.transactionService.fromNamed(new DeleteStorageTransaction(uuidv4(), id)))
    );
  };
}

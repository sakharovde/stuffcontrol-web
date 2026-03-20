import { Batch, BatchRepository } from '../../domain';
import IdbClient from '../clients/idb-client/idb-client.ts';
import TransactionService from '../../domain/services/transaction-service.ts';
import TransactionMapper from '../mappers/transaction-mapper.ts';
import { IdbTransaction } from '../clients/idb-client/idb-types.ts';
import AddProductsTransaction from '../../domain/entities/transactions/add-products-transaction.ts';
import RemoveProductsTransaction from '../../domain/entities/transactions/remove-products-transaction.ts';
import ChangeProductNameTransaction from '../../domain/entities/transactions/change-product-name-transaction.ts';
import { v7 as uuidv7 } from 'uuid';

type BatchAggregate = {
  id: string;
  productId: string;
  storageId: string;
  name: string;
  quantity: number;
  expirationDate: Date | null;
  createdAt: Date;
};

const DELETED_BATCH_PREFIX = '__DELETED__';

export default class BatchRepositoryImpl implements BatchRepository {
  constructor(
    private readonly idbClient: IdbClient,
    private readonly transactionService: TransactionService
  ) {}

  findAll = async (): Promise<Batch[]> => {
    const transactions = await this.idbClient.getAllTransactionWithStorageId();
    return this.mapTransactionsToBatches(transactions);
  };

  findAllByStorageId = async (storageId: Batch['storageId']): Promise<Batch[]> => {
    const transactions = await this.idbClient.getTransactionsByStorageId(storageId);
    return this.mapTransactionsToBatches(transactions);
  };

  findById = async (id: Batch['id']): Promise<Batch | null> => {
    const transactions = await this.idbClient.getTransactionsByBatchId(id);
    const aggregate = this.buildBatchAggregates(transactions).get(id);

    if (!aggregate || this.isDeletedAggregate(aggregate)) {
      return null;
    }

    return this.mapAggregateToDomain(aggregate);
  };

  save = async (batch: Batch): Promise<Batch> => {
    const existing = await this.findById(batch.id);

    const productId = batch.id;
    const normalizedQuantity = Math.max(0, Math.round(batch.quantity));

    if (!existing) {
      await this.appendTransaction(
        new AddProductsTransaction(
          uuidv7(),
          batch.storageId,
          productId,
          batch.id,
          batch.name,
          normalizedQuantity,
          batch.expirationDate ?? undefined
        )
      );
    } else {
      const delta = normalizedQuantity - existing.quantity;

      if (delta > 0) {
        await this.appendTransaction(
          new AddProductsTransaction(
            uuidv7(),
            batch.storageId,
            productId,
            batch.id,
            batch.name,
            delta,
            batch.expirationDate ?? undefined
          )
        );
      } else if (delta < 0) {
        await this.appendTransaction(
          new RemoveProductsTransaction(uuidv7(), batch.storageId, productId, batch.id, Math.abs(delta))
        );
      }

      if (existing.name !== batch.name) {
        await this.appendTransaction(new ChangeProductNameTransaction(uuidv7(), batch.storageId, productId, batch.name));
      }
    }

    const updated = await this.findById(batch.id);
    if (!updated) {
      throw new Error('Failed to persist batch');
    }

    return updated;
  };

  delete = async (id: Batch['id']): Promise<void> => {
    const existing = await this.findById(id);
    if (!existing || existing.quantity <= 0) {
      return;
    }

    await this.appendTransaction(
      new RemoveProductsTransaction(uuidv7(), existing.storageId, id, id, Math.abs(existing.quantity))
    );
    await this.appendTransaction(new ChangeProductNameTransaction(uuidv7(), existing.storageId, id, this.buildDeletedName(id)));
  };

  private appendTransaction = async (namedTransaction:
    | AddProductsTransaction
    | RemoveProductsTransaction
    | ChangeProductNameTransaction
  ) => {
    await this.idbClient.createTransaction(
      TransactionMapper.toPersistence(this.transactionService.fromNamed(namedTransaction))
    );
  };

  private mapTransactionsToBatches(transactions: IdbTransaction[]): Batch[] {
    const aggregates = this.buildBatchAggregates(transactions);

    return Array.from(aggregates.values())
      .filter((aggregate) => !this.isDeletedAggregate(aggregate))
      .map((aggregate) => this.mapAggregateToDomain(aggregate))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private buildBatchAggregates(transactions: IdbTransaction[]): Map<string, BatchAggregate> {
    const aggregates = new Map<string, BatchAggregate>();
    const ordered = [...transactions].sort((a, b) => a.createdAt - b.createdAt);

    for (const transaction of ordered) {
      switch (transaction.eventType) {
        case 'addProducts':
          this.applyAddProducts(aggregates, transaction);
          break;
        case 'removeProducts':
          this.applyRemoveProducts(aggregates, transaction);
          break;
        case 'changeProductName':
          this.applyChangeProductName(aggregates, transaction);
          break;
        default:
          break;
      }
    }

    return aggregates;
  }

  private applyAddProducts(aggregates: Map<string, BatchAggregate>, transaction: IdbTransaction) {
    if (!transaction.batchId) {
      return;
    }

    const quantity = transaction.data.quantity ?? 0;
    const productId = transaction.productId ?? transaction.batchId;
    const existing = aggregates.get(transaction.batchId);

    if (existing) {
      existing.quantity += quantity;
      if (!existing.expirationDate && transaction.data.expiryDate) {
        existing.expirationDate = new Date(transaction.data.expiryDate);
      }
      if (transaction.data.productName) {
        existing.name = transaction.data.productName;
      }
      return;
    }

    aggregates.set(transaction.batchId, {
      id: transaction.batchId,
      productId,
      storageId: transaction.storageId,
      name: transaction.data.productName ?? 'Unknown product',
      quantity,
      expirationDate: transaction.data.expiryDate ? new Date(transaction.data.expiryDate) : null,
      createdAt: new Date(transaction.createdAt),
    });
  }

  private applyRemoveProducts(aggregates: Map<string, BatchAggregate>, transaction: IdbTransaction) {
    if (!transaction.batchId) {
      return;
    }

    const existing = aggregates.get(transaction.batchId);

    if (!existing) {
      return;
    }

    const quantity = transaction.data.quantity ?? 0;
    existing.quantity = Math.max(0, existing.quantity - quantity);
  }

  private applyChangeProductName(aggregates: Map<string, BatchAggregate>, transaction: IdbTransaction) {
    if (!transaction.productId || !transaction.data.productName) {
      return;
    }

    for (const aggregate of aggregates.values()) {
      if (aggregate.productId === transaction.productId) {
        aggregate.name = transaction.data.productName;
      }
    }
  }

  private mapAggregateToDomain(aggregate: BatchAggregate): Batch {
    return new Batch(
      aggregate.id,
      aggregate.storageId,
      aggregate.name,
      aggregate.quantity,
      aggregate.expirationDate,
      aggregate.createdAt
    );
  }

  private isDeletedAggregate(aggregate: BatchAggregate): boolean {
    return aggregate.name === this.buildDeletedName(aggregate.id);
  }

  private buildDeletedName(batchId: string): string {
    return `${DELETED_BATCH_PREFIX}:${batchId}`;
  }
}

import { Product, ProductRepository } from '../../domain';
import IdbClient from '../clients/idb-client/idb-client.ts';
import TransactionService from '../../domain/services/transaction-service.ts';
import TransactionMapper from '../mappers/transaction-mapper.ts';
import ChangeProductNameTransaction from '../../domain/entities/transactions/change-product-name-transaction.ts';
import { IdbTransaction } from '../clients/idb-client/idb-types.ts';
import { v7 as uuidv7 } from 'uuid';

type ProductAggregate = {
  id: string;
  storageId: string;
  name: string;
  createdAt: Date;
};

export default class ProductRepositoryImpl implements ProductRepository {
  constructor(
    private readonly idbClient: IdbClient,
    private readonly transactionService: TransactionService
  ) {}

  async findById(id: string): Promise<Product | null> {
    const transactions = await this.idbClient.getTransactionsByProductId(id);
    const aggregate = this.buildAggregates(transactions).get(id);
    return aggregate ? this.mapAggregateToDomain(aggregate) : null;
  }

  async findAllByStorageId(storageId: string): Promise<Product[]> {
    const transactions = await this.idbClient.getTransactionsByStorageId(storageId);
    const aggregates = this.buildAggregates(transactions);
    return Array.from(aggregates.values())
      .filter((aggregate) => aggregate.storageId === storageId)
      .map((aggregate) => this.mapAggregateToDomain(aggregate));
  }

  async getAll(): Promise<Product[]> {
    const transactions = await this.idbClient.getAllTransactionWithStorageId();
    return Array.from(this.buildAggregates(transactions).values()).map((aggregate) =>
      this.mapAggregateToDomain(aggregate)
    );
  }

  async save(product: Product): Promise<Product> {
    const existing = await this.findById(product.id);
    if (!existing || existing.name !== product.name) {
      await this.appendTransaction(
        new ChangeProductNameTransaction(uuidv7(), product.storageId, product.id, product.name)
      );
    }

    return (await this.findById(product.id)) ?? product;
  }

  async delete(_id: Product['id']): Promise<void> {
    // Removing products is handled implicitly via batch removals.
    return Promise.resolve();
  }

  private appendTransaction = async (transaction: ChangeProductNameTransaction) => {
    await this.idbClient.createTransaction(
      TransactionMapper.toPersistence(this.transactionService.fromNamed(transaction))
    );
  };

  private buildAggregates(transactions: IdbTransaction[]): Map<string, ProductAggregate> {
    const aggregates = new Map<string, ProductAggregate>();
    const ordered = [...transactions]
      .filter((transaction) => !!transaction.productId)
      .sort((a, b) => a.createdAt - b.createdAt);

    for (const transaction of ordered) {
      const productId = transaction.productId!;
      let aggregate = aggregates.get(productId);

      if (!aggregate) {
        aggregate = {
          id: productId,
          storageId: transaction.storageId,
          name: transaction.data.productName ?? 'Unknown product',
          createdAt: new Date(transaction.createdAt),
        };
        aggregates.set(productId, aggregate);
      }

      const isNameEvent = transaction.eventType === 'addProducts' || transaction.eventType === 'changeProductName';
      if (isNameEvent && transaction.data.productName) {
        aggregate.name = transaction.data.productName;
      }
    }

    return aggregates;
  }

  private mapAggregateToDomain(aggregate: ProductAggregate): Product {
    return new Product(
      aggregate.id,
      aggregate.storageId,
      aggregate.name,
      null,
      null,
      aggregate.createdAt,
      aggregate.createdAt
    );
  }
}

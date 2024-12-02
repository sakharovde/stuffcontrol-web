import {
  Batch,
  BatchRepository,
  ProductRepository,
  StorageTransaction,
  StorageTransactionRepository,
} from '../../domain';
import { v4 as uuidv4 } from 'uuid';

export default class BatchService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly productRepository: ProductRepository,
    private readonly storageTransactionRepository: StorageTransactionRepository
  ) {}

  async create(productId: string, quantity: number, expirationDate: Date | null): Promise<Batch> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const batch = new Batch(uuidv4(), productId, quantity, expirationDate);
    await this.batchRepository.save(batch);

    await this.storageTransactionRepository.save(
      new StorageTransaction(uuidv4(), product.storageId, product.id, quantity)
    );

    return batch;
  }

  async findAllByProductId(productId: string): Promise<Batch[]> {
    return this.batchRepository.findAllByProductId(productId);
  }

  async changeQuantity(id: Batch['id'], quantity: number): Promise<void> {
    const batch = await this.batchRepository.findById(id);

    if (!batch) {
      throw new Error('Batch not found');
    }

    const product = await this.productRepository.findById(batch.productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const quantityDelta = quantity - batch.quantity;

    batch.quantity = quantity;
    await this.batchRepository.save(batch);

    await this.storageTransactionRepository.save(
      new StorageTransaction(uuidv4(), product.storageId, product.id, quantityDelta)
    );
  }

  async findById(id: Batch['id']): Promise<Batch | null> {
    return this.batchRepository.findById(id);
  }
}

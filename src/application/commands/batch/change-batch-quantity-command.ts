import BatchDto from '../../dto/batch-dto.ts';
import BatchEventEmitter from '../../events/batch-event-emitter.ts';
import {
  BatchProduct,
  BatchProductRepository,
  BatchRepository,
  Product,
  ProductRepository,
  StorageTransaction,
  StorageTransactionRepository,
} from '../../../domain';
import { v4 as uuidv4 } from 'uuid';

export interface ChangeBatchQuantityCommand {
  batchId: BatchDto['id'];
  quantity: BatchDto['quantity'];
}

export default class ChangeBatchQuantityCommandHandler {
  constructor(
    private readonly batchEventEmitter: BatchEventEmitter,
    private readonly batchRepository: BatchRepository,
    private readonly productRepository: ProductRepository,
    private readonly storageTransactionRepository: StorageTransactionRepository,
    private readonly batchProductRepository: BatchProductRepository
  ) {}

  execute = async (command: ChangeBatchQuantityCommand): Promise<void> => {
    const batch = await this.batchRepository.findById(command.batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    let batchProducts = await this.batchProductRepository.findAllByBatchId(batch.id);
    const quantityDelta = command.quantity - batchProducts.length;

    if (quantityDelta < 0) {
      for (let i = 0; i < -quantityDelta; i++) {
        await this.batchProductRepository.delete(batchProducts[i].id);
        await this.productRepository.delete(batchProducts[i].productId);
      }
    }

    if (quantityDelta > 0) {
      for (let i = 0; i < quantityDelta; i++) {
        await this.productRepository
          .save(new Product(uuidv4(), batch.storageId, batch.name, batch.expirationDate))
          .then((product) => {
            return this.batchProductRepository.save(new BatchProduct(uuidv4(), batch.id, product.id));
          });
      }
    }

    batchProducts = await this.batchProductRepository.findAllByBatchId(batch.id);

    batch.quantity = batchProducts.length;
    await this.batchRepository.save(batch);
    this.batchEventEmitter.emit('batchUpdated');

    await this.storageTransactionRepository.save(
      new StorageTransaction(uuidv4(), batch.storageId, batchProducts[0]?.id, quantityDelta)
    );
  };
}

import BatchDto from '../../dto/batch-dto.ts';
import BatchEventEmitter from '../../events/batch-event-emitter.ts';
import { BatchRepository, ProductRepository, StorageTransaction, StorageTransactionRepository } from '../../../domain';
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
    private readonly storageTransactionRepository: StorageTransactionRepository
  ) {}

  execute = async (command: ChangeBatchQuantityCommand): Promise<void> => {
    const batch = await this.batchRepository.findById(command.batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    const product = await this.productRepository.findById(batch.productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const quantityDelta = command.quantity - batch.quantity;

    batch.quantity = command.quantity;
    await this.batchRepository.save(batch);

    await this.storageTransactionRepository.save(
      new StorageTransaction(uuidv4(), product.storageId, product.id, quantityDelta)
    );

    this.batchEventEmitter.emit('batchUpdated');
  };
}

import ProductDto from '../../dto/product-dto.ts';
import StorageDto from '../../dto/storage-dto.ts';
import BatchDto from '../../dto/batch-dto.ts';
import ProductEventEmitter from '../../events/product-event-emitter.ts';
import BatchEventEmitter from '../../events/batch-event-emitter.ts';
import {
  Batch,
  BatchProduct,
  BatchProductRepository,
  BatchRepository,
  Product,
  ProductNameEmptySpecification,
  ProductRepository,
  StorageTransaction,
  StorageTransactionRepository,
} from '../../../domain';
import { v4 as uuidv4 } from 'uuid';

export interface AddNewProductToStorageCommand {
  storageId: StorageDto['id'];
  productName: ProductDto['name'];
  quantity: BatchDto['quantity'];
  expirationDate: BatchDto['expirationDate'];
}

export default class AddNewProductsToStorageCommandHandler {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productNameEmptySpecification: ProductNameEmptySpecification,
    private readonly batchRepository: BatchRepository,
    private readonly storageTransactionRepository: StorageTransactionRepository,
    private readonly productEventEmitter: ProductEventEmitter,
    private readonly batchEventEmitter: BatchEventEmitter,
    private readonly batchProductRepository: BatchProductRepository
  ) {}

  execute = async (command: AddNewProductToStorageCommand): Promise<void> => {
    const isProductNameEmpty = await this.productNameEmptySpecification.isSatisfiedBy(command.productName);

    if (isProductNameEmpty) {
      throw new Error('Product name cannot be empty');
    }

    if (command.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const batch = new Batch(uuidv4(), command.storageId, command.productName, command.quantity, command.expirationDate);
    await this.batchRepository.save(batch);
    this.batchEventEmitter.emit('batchCreated');

    for (let i = 0; i < command.quantity; i++) {
      const product = await this.productRepository.save(
        new Product(uuidv4(), command.storageId, command.productName, command.expirationDate)
      );
      await this.batchProductRepository.save(new BatchProduct(uuidv4(), batch.id, product.id));
    }

    this.productEventEmitter.emit('productCreated');
    const batchProducts = await this.batchProductRepository.findAllByBatchId(batch.id);

    if (batchProducts.length !== 0) {
      await this.storageTransactionRepository.save(
        new StorageTransaction(uuidv4(), command.storageId, batchProducts[0].productId, command.quantity)
      );
    }
  };
}

import ProductDto from '../../dto/product-dto.ts';
import StorageDto from '../../dto/storage-dto.ts';
import BatchDto from '../../dto/batch-dto.ts';
import ProductEventEmitter from '../../events/product-event-emitter.ts';
import BatchEventEmitter from '../../events/batch-event-emitter.ts';
import {
  Batch,
  BatchRepository,
  Product,
  ProductItem,
  ProductItemRepository,
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

export default class AddNewProductToStorageCommandHandler {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productNameEmptySpecification: ProductNameEmptySpecification,
    private readonly batchRepository: BatchRepository,
    private readonly storageTransactionRepository: StorageTransactionRepository,
    private readonly productEventEmitter: ProductEventEmitter,
    private readonly batchEventEmitter: BatchEventEmitter,
    private readonly productItemRepository: ProductItemRepository
  ) {}

  execute = async (command: AddNewProductToStorageCommand): Promise<void> => {
    const isProductNameEmpty = await this.productNameEmptySpecification.isSatisfiedBy(command.productName);

    if (isProductNameEmpty) {
      throw new Error('Product name cannot be empty');
    }

    const product = await this.productRepository.save(new Product(uuidv4(), command.storageId, command.productName));

    this.productEventEmitter.emit('productCreated');

    if (command.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const batch = new Batch(uuidv4(), product.id, command.quantity, command.expirationDate);
    await this.batchRepository.save(batch);

    for (let i = 0; i < command.quantity; i++) {
      await this.productItemRepository.save(new ProductItem(uuidv4(), product.id, batch.id, command.expirationDate));
    }

    await this.storageTransactionRepository.save(
      new StorageTransaction(uuidv4(), product.storageId, product.id, command.quantity)
    );

    this.batchEventEmitter.emit('batchCreated');
  };
}

import ProductService from '../../services/product-service.ts';
import ProductDto from '../../dto/product-dto.ts';
import StorageDto from '../../dto/storage-dto.ts';
import BatchDto from '../../dto/batch-dto.ts';
import BatchService from '../../services/batch-service.ts';
import ProductEventEmitter from '../../events/product-event-emitter.ts';
import BatchEventEmitter from '../../events/batch-event-emitter.ts';

export interface AddNewProductToStorageCommand {
  storageId: StorageDto['id'];
  productName: ProductDto['name'];
  quantity: BatchDto['quantity'];
  expirationDate: BatchDto['expirationDate'];
}

export default class AddNewProductToStorageCommandHandler {
  constructor(
    private readonly productService: ProductService,
    private readonly batchService: BatchService,
    private readonly productEventEmitter: ProductEventEmitter,
    private readonly batchEventEmitter: BatchEventEmitter
  ) {}

  execute = async (command: AddNewProductToStorageCommand): Promise<void> => {
    const product = await this.productService.createProduct(command.storageId, command.productName);

    this.productEventEmitter.emit('productCreated');

    await this.batchService.create(product.id, command.quantity, command.expirationDate);

    this.batchEventEmitter.emit('batchCreated');
  };
}

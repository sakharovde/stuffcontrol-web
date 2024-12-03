import StorageEventEmitter from '../../events/storage-event-emitter.ts';
import { ProductRepository } from '../../../domain';
import ProductDto from '../../dto/product-dto.ts';

export interface RemoveProductCommand {
  productId: ProductDto['id'];
}

export default class RemoveProductCommandHandler {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: RemoveProductCommand): Promise<void> => {
    const storageItem = await this.productRepository.findById(command.productId);

    if (storageItem) {
      return this.productRepository.delete(storageItem);
    }

    this.storageEventEmitter.emit('storageUpdated');
  };
}

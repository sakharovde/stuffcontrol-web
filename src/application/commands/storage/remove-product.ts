import { ProductDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export default class RemoveProduct {
  constructor(
    private storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (args: { productId: ProductDto['id'] }): Promise<void> => {
    const result = await this.storageService.removeProduct(args.productId);
    this.storageEventEmitter.emit('storageUpdated');
    return result;
  };
}

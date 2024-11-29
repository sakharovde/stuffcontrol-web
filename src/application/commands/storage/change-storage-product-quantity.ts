import { StorageProductDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export default class ChangeStorageProductQuantity {
  constructor(
    private readonly storageItemService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (args: {
    productId: StorageProductDto['id'];
    quantity: StorageProductDto['quantity'];
  }): Promise<StorageProductDto> => {
    const result = await this.storageItemService.changeProductQuantity(args.productId, args.quantity);

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}

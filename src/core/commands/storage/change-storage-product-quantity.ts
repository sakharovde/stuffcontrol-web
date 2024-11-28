import { StorageItemService } from '../../../application';
import { StorageEventEmitter } from '../../../events';
import { Product, StorageItem } from '../../../domain';

export default class ChangeStorageProductQuantity {
  constructor(
    private readonly storageItemService: StorageItemService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (args: {
    storageId: Storage['id'];
    productId: Product['id'];
    quantity: StorageItem['quantity'];
  }): Promise<StorageItem> => {
    const result = await this.storageItemService.changeQuantity(args.storageId, args.productId, args.quantity);

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}

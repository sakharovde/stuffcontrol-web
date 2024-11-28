import { StorageItemService } from '../../../application';
import { StorageEventBus } from '../../../events';
import { Product, StorageItem } from '../../../domain';

export default class ChangeStorageProductQuantity {
  constructor(
    private readonly storageItemService: StorageItemService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (args: {
    storageId: Storage['id'];
    productId: Product['id'];
    quantity: StorageItem['quantity'];
  }): Promise<StorageItem> => {
    const result = await this.storageItemService.changeQuantity(args.storageId, args.productId, args.quantity);

    this.storageEventBus.emit('storageUpdated');

    return result;
  };
}

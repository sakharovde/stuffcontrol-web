import Product from '../../../domain/models/product.ts';
import StorageItem from '../../../domain/models/storage-item.ts';
import StorageItemService from '../../../application/services/storage-item-service.ts';
import StorageEventBus from '../../../events/storage-event-bus.ts';

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

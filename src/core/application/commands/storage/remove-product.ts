import StorageItemService from '../../services/storage-item-service.ts';
import Product from '../../../domain/models/product.ts';
import Storage from '../../../domain/models/storage.ts';
import StorageEventBus from '../../events/storage-event-bus.ts';

export default class RemoveProduct {
  constructor(
    private storageItemService: StorageItemService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (args: { productId: Product['id']; storageId: Storage['id'] }): Promise<void> => {
    const result = await this.storageItemService.remove(args.storageId, args.productId);
    this.storageEventBus.emit('storageUpdated');
    return result;
  };
}

import { StorageItemService } from '../../../application';
import { StorageEventBus } from '../../../events';
import { Product } from '../../../domain';

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

import { StorageItemService } from '../../../application';
import { StorageEventEmitter } from '../../../events';
import { Product } from '../../../domain';

export default class RemoveProduct {
  constructor(
    private storageItemService: StorageItemService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (args: { productId: Product['id']; storageId: Storage['id'] }): Promise<void> => {
    const result = await this.storageItemService.remove(args.storageId, args.productId);
    this.storageEventEmitter.emit('storageUpdated');
    return result;
  };
}

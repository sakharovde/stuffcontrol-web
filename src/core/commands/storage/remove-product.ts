import { StorageProductDto, StorageService } from '../../../application';
import { StorageEventEmitter } from '../../../events';

export default class RemoveProduct {
  constructor(
    private storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (args: { productId: StorageProductDto['id'] }): Promise<void> => {
    const result = await this.storageService.removeProduct(args.productId);
    this.storageEventEmitter.emit('storageUpdated');
    return result;
  };
}

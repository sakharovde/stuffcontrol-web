import StorageItemService from '../services/storage-item-service.ts';
import Product from '../../domain/models/product.ts';
import Storage from '../../domain/models/storage.ts';

export default class RemoveProductUseCase {
  constructor(private storageItemService: StorageItemService) {}

  execute = async (args: { productId: Product['id']; storageId: Storage['id'] }): Promise<void> => {
    return this.storageItemService.remove(args.storageId, args.productId);
  };
}

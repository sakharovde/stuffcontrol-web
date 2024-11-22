import Product from '../../../domain/models/product.ts';
import StorageItem from '../../../domain/models/storage-item.ts';
import StorageItemService from '../../services/storage-item.ts';

export default class ChangeStorageProductQuantityUseCase {
  constructor(private readonly storageItemService: StorageItemService) {}

  execute = (args: {
    storageId: Storage['id'];
    productId: Product['id'];
    quantityChange: StorageItem['quantity'];
  }): Promise<StorageItem> => {
    return this.storageItemService.changeQuantity(args.storageId, args.productId, args.quantityChange);
  };
}

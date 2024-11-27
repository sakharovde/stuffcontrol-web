import Product from '../../../domain/models/product.ts';
import StorageItem from '../../../domain/models/storage-item.ts';
import StorageItemService from '../../services/storage-item-service.ts';

export default class ChangeStorageProductQuantity {
  constructor(private readonly storageItemService: StorageItemService) {}

  execute = (args: {
    storageId: Storage['id'];
    productId: Product['id'];
    quantity: StorageItem['quantity'];
  }): Promise<StorageItem> => {
    return this.storageItemService.changeQuantity(args.storageId, args.productId, args.quantity);
  };
}

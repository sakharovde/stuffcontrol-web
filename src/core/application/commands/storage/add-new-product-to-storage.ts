import ProductService from '../../services/product-service.ts';
import Product from '../../../domain/models/product.ts';
import StorageItem from '../../../domain/models/storage-item.ts';
import Storage from '../../../domain/models/storage.ts';
import StorageItemService from '../../services/storage-item-service.ts';

export default class AddNewProductToStorage {
  constructor(
    private readonly productService: ProductService,
    private readonly storageItemService: StorageItemService
  ) {}

  execute = async (args: {
    storageId: Storage['id'];
    productName: Product['name'];
    quantity: StorageItem['quantity'];
  }): Promise<StorageItem> => {
    const product = await this.productService.create(args.productName);

    return this.storageItemService.changeQuantity(args.storageId, product.id, args.quantity);
  };
}

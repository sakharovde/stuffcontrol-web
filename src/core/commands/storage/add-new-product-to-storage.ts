import { ProductService, StorageService } from '../../../application';
import { StorageEventEmitter } from '../../../events';
import { Product, StorageItem } from '../../../domain';

export default class AddNewProductToStorage {
  constructor(
    private readonly productService: ProductService,
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (args: {
    storageId: Storage['id'];
    productName: Product['name'];
    quantity: StorageItem['quantity'];
  }): Promise<StorageItem> => {
    const product = await this.productService.create(args.productName);
    const result = await this.storageService.changeProductQuantity(args.storageId, product.id, args.quantity);

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}

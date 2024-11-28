import ProductService from '../../../application/services/product-service.ts';
import Product from '../../../domain/models/product.ts';
import StorageItem from '../../../domain/models/storage-item.ts';
import Storage from '../../../domain/models/storage.ts';
import StorageItemService from '../../../application/services/storage-item-service.ts';
import StorageEventBus from '../../../events/storage-event-bus.ts';

export default class AddNewProductToStorage {
  constructor(
    private readonly productService: ProductService,
    private readonly storageItemService: StorageItemService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (args: {
    storageId: Storage['id'];
    productName: Product['name'];
    quantity: StorageItem['quantity'];
  }): Promise<StorageItem> => {
    const product = await this.productService.create(args.productName);
    const result = await this.storageItemService.changeQuantity(args.storageId, product.id, args.quantity);

    this.storageEventBus.emit('storageUpdated');

    return result;
  };
}

import ProductService from '../../services/product.ts';
import Product from '../../../domain/models/product.ts';
import StorageItem from '../../../domain/models/storage-item.ts';
import Storage from '../../../domain/models/storage.ts';
import StorageItemService from '../../services/storage-item.ts';

export default class AddNewProductToStorageUseCase {
  constructor(
    private readonly productService: ProductService,
    private readonly storageItemService: StorageItemService
  ) {}

  async execute(
    storageId: Storage['id'],
    productName: Product['name'],
    quantityChange: StorageItem['quantity']
  ): Promise<StorageItem> {
    const product = await this.productService.create(productName);

    return this.storageItemService.changeQuantity(storageId, product.id, quantityChange);
  }
}

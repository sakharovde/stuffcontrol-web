import Storage from '../../domain/models/storage.ts';
import StorageItem from '../../domain/models/storage-item.ts';
import Product from '../../domain/models/product.ts';
import StorageProductDto, { StorageProductDtoFactory } from './storage-product-dto.ts';

export default interface StorageWithProductsDto {
  id: Storage['id'];
  name: Storage['name'];
  products: Array<StorageProductDto>;
}

export class StorageWithProductsDtoFactory {
  public static create = (
    storage: Storage,
    storageItems: StorageItem[],
    products: Product[]
  ): StorageWithProductsDto => {
    return {
      id: storage.id,
      name: storage.name,
      products: storageItems
        .filter((storageItem) => storageItem.storageId === storage.id)
        .reduce(
          (acc, storageItem) => {
            const product = products.find((product) => product.id === storageItem.productId);

            if (!product) return acc;

            return [...acc, StorageProductDtoFactory.create(storageItem, product)];
          },
          [] as StorageWithProductsDto['products']
        ),
    };
  };
}

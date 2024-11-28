import StorageProductDto, { StorageProductDtoFactory } from './storage-product-dto.ts';
import { Product, Storage, StorageItem } from '../../domain';
import { StorageDtoFactory } from './storage-dto.ts';

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
      ...StorageDtoFactory.create(storage),
      products: storageItems
        .filter((storageItem) => storageItem.storageId === storage.id)
        .reduce((acc, storageItem) => {
          if (storageItem.storageId !== storage.id) return acc;

          const product = products.find((product) => product.id === storageItem.productId);

          if (!product) return acc;

          return [...acc, StorageProductDtoFactory.create(storageItem, product)];
        }, [] as StorageProductDto[]),
    };
  };
}

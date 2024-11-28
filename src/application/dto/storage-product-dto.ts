import { Product, StorageItem } from '../../domain';

export default interface StorageProductDto {
  id: Product['id'];
  name: Product['name'];
  storageId: StorageItem['storageId'];
  quantity: StorageItem['quantity'];
}

export class StorageProductDtoFactory {
  static create(storageItem: StorageItem, product: Product): StorageProductDto {
    return {
      id: product.id,
      name: product.name,
      storageId: storageItem.storageId,
      quantity: storageItem.quantity,
    };
  }
}

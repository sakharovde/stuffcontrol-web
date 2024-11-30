import { StorageItem } from '../../domain';

export default interface StorageProductDto {
  readonly id: StorageItem['id'];
  readonly name: StorageItem['name'];
  readonly storageId: StorageItem['storageId'];
  readonly quantity: StorageItem['quantity'];
  readonly createdAt: StorageItem['createdAt'];
}

export class StorageProductDtoFactory {
  static create(storageItem: StorageItem): StorageProductDto {
    return {
      id: storageItem.id,
      name: storageItem.name,
      storageId: storageItem.storageId,
      quantity: storageItem.quantity,
      createdAt: storageItem.createdAt,
    };
  }
}

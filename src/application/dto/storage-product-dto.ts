import { Product, StorageItem } from '../../domain';

export default interface StorageProductDto {
  id: Product['id'];
  name: Product['name'];
  storageId: StorageItem['storageId'];
  quantity: StorageItem['quantity'];
  shelfLife: Product['shelfLife'];
  shelfLifeAfterOpening: Product['shelfLifeAfterOpening'];
  manufacturingDate: StorageItem['manufacturingDate'];
  openingDate: StorageItem['openingDate'];
}

export class StorageProductDtoFactory {
  static create(storageItem: StorageItem, product: Product): StorageProductDto {
    return {
      id: storageItem.id,
      name: product.name,
      storageId: storageItem.storageId,
      quantity: storageItem.quantity,
      shelfLife: product.shelfLife,
      shelfLifeAfterOpening: product.shelfLifeAfterOpening,
      manufacturingDate: storageItem.manufacturingDate,
      openingDate: storageItem.openingDate,
    };
  }
}

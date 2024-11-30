import { Product } from '../../domain';

export default interface ProductDto {
  readonly id: Product['id'];
  readonly name: Product['name'];
  readonly storageId: Product['storageId'];
  readonly quantity: number;
  readonly createdAt: Product['createdAt'];
}

export class ProductDtoFactory {
  static create(storageItem: Product, quantity: ProductDto['quantity']): ProductDto {
    return {
      id: storageItem.id,
      name: storageItem.name,
      storageId: storageItem.storageId,
      quantity,
      createdAt: storageItem.createdAt,
    };
  }
}

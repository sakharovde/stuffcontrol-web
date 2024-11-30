import { ProductItem, ProductItemRepository } from '../../../domain';
import LocalForageFactory from '../localforage-factory.ts';
import ProductItemMapper from '../mappers/product-item.ts';

export default class ProductItemRepositoryImpl implements ProductItemRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'product-items',
    storeName: 'v1',
    description: 'Database for storage items',
  });

  async save(productItem: ProductItem): Promise<ProductItem> {
    await this.client.setItem(productItem.id, ProductItemMapper.toPersistence(productItem));

    return productItem;
  }

  async findById(id: ProductItem['id']): Promise<ProductItem | null> {
    const item = await this.client.getItem(id);

    return ProductItemMapper.toDomain(item);
  }

  async findAllByProductId(productId: ProductItem['productId']): Promise<ProductItem[]> {
    const productItems = await this.getAll();
    return productItems.filter((productItem) => productItem.productId === productId);
  }

  async getAll(): Promise<ProductItem[]> {
    const productItems: ProductItem[] = [];
    await this.client.iterate((value) => {
      productItems.push(ProductItemMapper.toDomain(value));
    });
    return productItems;
  }

  async delete(productItem: ProductItem): Promise<void> {
    await this.client.removeItem(productItem.id);
  }
}

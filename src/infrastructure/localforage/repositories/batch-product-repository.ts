import LocalForageFactory from '../localforage-factory.ts';
import { BatchProduct, BatchProductRepository } from '../../../domain';
import BatchProductMapper from '../mappers/batch-product-mapper.ts';

export default class BatchProductRepositoryImpl implements BatchProductRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'batch-product',
    storeName: 'v1',
    description: 'Database for batch products',
  });

  findAll = async () => {
    const batchProducts: BatchProduct[] = [];

    await this.client.iterate((value) => batchProducts.push(BatchProductMapper.toDomain(value)));

    return batchProducts;
  };

  findAllByBatchId = async (batchId: BatchProduct['batchId']) => {
    const allBatchProducts: BatchProduct[] = await this.findAll();
    return allBatchProducts.filter((batchProduct) => batchProduct.batchId === batchId);
  };

  findAllByProductId = async (productId: BatchProduct['productId']) => {
    const allBatchProducts: BatchProduct[] = await this.findAll();
    return allBatchProducts.filter((batchProduct) => batchProduct.productId === productId);
  };

  findById = async (id: BatchProduct['id']) => {
    const batchProduct = await this.client.getItem(id);
    return batchProduct ? BatchProductMapper.toDomain(batchProduct) : null;
  };

  save = async (batchProduct: BatchProduct) => {
    await this.client.setItem(batchProduct.id, BatchProductMapper.toPersistence(batchProduct));
  };

  delete = async (id: BatchProduct['id']) => {
    await this.client.removeItem(id);
  };
}

import BatchProduct from '../models/batch-product.ts';

export default interface BatchProductRepository {
  findAllByBatchId: (batchId: BatchProduct['batchId']) => Promise<BatchProduct[]>;
  findAllByProductId: (productId: BatchProduct['productId']) => Promise<BatchProduct[]>;
  findById: (id: BatchProduct['id']) => Promise<BatchProduct | null>;
  save: (batchProduct: BatchProduct) => Promise<void>;
  delete: (id: BatchProduct['id']) => Promise<void>;
}

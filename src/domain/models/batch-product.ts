import Batch from './batch.ts';
import Product from './product.ts';

export default class BatchProduct {
  constructor(
    public readonly id: string,
    public readonly batchId: Batch['id'],
    public readonly productId: Product['id'],
    public readonly createdAt: Date = new Date()
  ) {}
}

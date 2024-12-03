import Product from './product.ts';
import Batch from './batch.ts';

export default class ProductItem {
  constructor(
    public readonly id: string,
    public readonly productId: Product['id'],
    public readonly batchId: Batch['id'],

    public expirationDate: Date | null = null,

    public removedAt: Date | null = null,
    public readonly addedAt: Date = new Date(),
    public readonly createdAt: Date = new Date()
  ) {}
}

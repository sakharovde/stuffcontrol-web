import Product from './product.ts';

export default class ProductItem {
  constructor(
    public readonly id: string,
    public readonly productId: Product['id'],

    public removedAt: Date | null = null,
    public readonly addedAt: Date = new Date(),
    public readonly createdAt: Date = new Date()
  ) {}
}

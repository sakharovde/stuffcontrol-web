import Product from './product.ts';

export default class Batch {
  constructor(
    public readonly id: string,
    public readonly storageId: string,
    public name: Product['name'],

    public quantity: number,
    public expirationDate: Product['expirationDate'],
    public readonly createdAt: Date = new Date()
  ) {}
}

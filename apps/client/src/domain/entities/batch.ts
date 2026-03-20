import Product from './product.ts';
import { UUID } from './types/uuid.ts';

export default class Batch {
  constructor(
    public readonly id: UUID,
    public readonly storageId: UUID,
    public name: Product['name'],

    public quantity: number,
    public expirationDate: Product['expirationDate'],
    public readonly createdAt: Date = new Date()
  ) {}
}

import Product from './product.ts';
import Storage from './storage.ts';

export default class StorageTransaction {
  constructor(
    public id: string,
    public storageId: Storage['id'],
    public productId: Product['id'],
    public quantityChange: number,
    public state: 'pending' | 'applied',
    public createdAt: Date = new Date()
  ) {}
}

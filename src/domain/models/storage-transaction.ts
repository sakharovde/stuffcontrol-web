import StorageItem from './storage-item.ts';
import Storage from './storage.ts';

export default class StorageTransaction {
  constructor(
    public id: string,
    public storageId: Storage['id'],
    public productId: StorageItem['id'],
    public quantityChange: number,
    public state: 'pending' | 'applied',
    public createdAt: Date = new Date()
  ) {}
}

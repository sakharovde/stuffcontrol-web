export default class StorageTransaction {
  constructor(
    public id: string,
    public storageId: string,
    public productId: string,
    public quantityChange: number,
    public state: 'pending' | 'applied',
    public createdAt: Date = new Date()
  ) {}
}

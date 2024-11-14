export default class StorageItem {
  constructor(
    public id: string,
    public storageId: string,
    public productId: string,
    public quantity: number,
    public createdAt: Date = new Date()
  ) {}
}

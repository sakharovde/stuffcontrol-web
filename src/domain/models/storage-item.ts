export default class StorageItem {
  constructor(
    public readonly id: string,
    public storageId: string,
    public name: string,
    public quantity: number,
    public readonly createdAt: Date = new Date()
  ) {}
}

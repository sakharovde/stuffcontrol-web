export default class StorageItem {
  constructor(
    public id: string,
    public storageId: string,
    public productId: string,
    public quantity: number,
    public manufacturingDate: Date | null = null,
    public openingDate: Date | null = null,
    public createdAt: Date = new Date()
  ) {}
}

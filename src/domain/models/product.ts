export default class Product {
  constructor(
    public readonly id: string,
    public readonly storageId: string,

    public name: string,

    public expirationDate: Date | null = null,

    public removedAt: Date | null = null,
    public readonly addedAt: Date = new Date(),
    public readonly createdAt: Date = new Date()
  ) {}
}

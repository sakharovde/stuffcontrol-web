export default class Product {
  constructor(
    public readonly id: string,
    public readonly storageId: string,

    public name: string,

    public readonly createdAt: Date = new Date()
  ) {}
}

export default class Batch {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public quantity: number,
    public expirationDate: Date | null = null,
    public readonly createdAt: Date = new Date()
  ) {}
}

export default class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public shelfLife: number | null, // days
    public shelfLifeAfterOpening: number | null // days
  ) {}
}

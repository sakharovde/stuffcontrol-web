import Product from '../models/product.ts';

export default class ProductNameEmptySpecification {
  async isSatisfiedBy(name: Product['name']): Promise<boolean> {
    return !name || !name.trim();
  }
}

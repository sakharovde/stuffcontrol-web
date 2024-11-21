import ProductRepository from '../../domain/repositories/product.ts';
import Product from '../../domain/models/product.ts';
import { v4 as uuidv4 } from 'uuid';

export default class ProductService {
  constructor(private productRepository: ProductRepository) {}

  create(name: Product['name']): Promise<Product> {
    const product = new Product(uuidv4(), name);
    return this.productRepository.save(product);
  }
}

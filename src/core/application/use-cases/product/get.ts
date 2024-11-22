import ProductService from '../../services/product.ts';
import Product from '../../../domain/models/product.ts';

export default class GetProductUseCase {
  constructor(private readonly productService: ProductService) {}

  execute = async (productId: Product['id']): Promise<Product | null> => {
    return this.productService.getById(productId);
  };
}

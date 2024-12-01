import { ProductItem, ProductItemRepository } from '../../../domain';
import ProductDto from '../../dto/product-dto.ts';

export interface GetProductItemsByProductQuery {
  productId: ProductDto['id'];
}

export default class GetProductItemsByProductQueryHandler {
  constructor(private readonly productItemRepository: ProductItemRepository) {}

  execute = (query: GetProductItemsByProductQuery): Promise<ProductItem[]> => {
    return this.productItemRepository.findAllByProductId(query.productId);
  };
}

import StorageDto from '../dto/storage-dto.ts';
import ProductDto, { ProductDtoFactory } from '../dto/product-dto.ts';
import { Product, ProductNameEmptySpecification, ProductRepository } from '../../domain';
import { v4 as uuidv4 } from 'uuid';

export default class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productNameEmptySpecification: ProductNameEmptySpecification
  ) {}

  async createProduct(storageId: StorageDto['id'], productName: ProductDto['name']): Promise<ProductDto> {
    const isNameEmpty = await this.productNameEmptySpecification.isSatisfiedBy(productName);

    if (isNameEmpty) {
      throw new Error('Product name cannot be empty');
    }

    const product = await this.productRepository.save(new Product(uuidv4(), storageId, productName));

    return ProductDtoFactory.create(product, 0);
  }
}

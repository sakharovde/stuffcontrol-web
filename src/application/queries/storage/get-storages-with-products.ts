import StorageWithProductsDto, { StorageWithProductsDtoFactory } from '../../dto/storage-with-products-dto.ts';
import { BatchRepository, ProductRepository, StorageRepository } from '../../../domain';
import StorageDto from '../../dto/storage-dto.ts';
import ProductDto, { ProductDtoFactory } from '../../dto/product-dto.ts';

export default class GetStoragesWithProductsQueryHandler {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly batchRepository: BatchRepository,
    private readonly productRepository: ProductRepository
  ) {}

  private readonly getAllProducts = async (storageId: StorageDto['id']): Promise<ProductDto[]> => {
    const products = await this.productRepository.findAllByStorageId(storageId);

    return await Promise.all(
      products.map(async (product) => {
        const batches = await this.batchRepository.findAllByProductId(product.id);
        const quantity = batches.reduce((acc, batch) => acc + batch.quantity, 0);

        return ProductDtoFactory.create(product, quantity);
      })
    );
  };

  execute = async (): Promise<StorageWithProductsDto[]> => {
    const storages = await this.storageRepository.getAll();
    const result: StorageWithProductsDto[] = [];

    for (const storage of storages) {
      const products = await this.getAllProducts(storage.id);
      result.push(StorageWithProductsDtoFactory.create(storage, products));
    }

    return result;
  };
}

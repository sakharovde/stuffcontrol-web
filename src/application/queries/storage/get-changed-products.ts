import StorageService from '../../services/storage-service.ts';
import ProductDto from '../../dto/product-dto.ts';

export interface GetChangedProductsQuery {
  storageId: string;
}

export default class GetChangedProductsQueryHandler {
  constructor(private readonly storageService: StorageService) {}

  execute = async (query: GetChangedProductsQuery): Promise<ProductDto[]> => {
    return await this.storageService.getAllChangedProducts(query.storageId);
  };
}

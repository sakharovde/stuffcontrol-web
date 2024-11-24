import StorageService from '../services/storage-service.ts';
import StorageProductDto from '../dto/storage-product-dto.ts';

export default class GetChangedStorageProductsUseCase {
  constructor(private readonly storageService: StorageService) {}

  execute = async (storageId: string): Promise<StorageProductDto[]> => {
    return await this.storageService.getAllChangedProducts(storageId);
  };
}

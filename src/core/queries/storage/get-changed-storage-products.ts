import StorageService from '../../../application/services/storage-service.ts';
import StorageProductDto from '../../../application/dto/storage-product-dto.ts';

export default class GetChangedStorageProducts {
  constructor(private readonly storageService: StorageService) {}

  execute = async (storageId: string): Promise<StorageProductDto[]> => {
    return await this.storageService.getAllChangedProducts(storageId);
  };
}

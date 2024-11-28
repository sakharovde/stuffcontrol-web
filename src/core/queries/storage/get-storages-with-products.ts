import StorageService from '../../../application/services/storage-service.ts';
import StorageWithProductsDto from '../../../application/dto/storage-with-products-dto.ts';

export default class GetStoragesWithProducts {
  constructor(private readonly storageService: StorageService) {}

  execute = (): Promise<StorageWithProductsDto[]> => {
    return this.storageService.getAllWithProducts();
  };
}

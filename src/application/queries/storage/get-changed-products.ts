import StorageService from '../../services/storage-service.ts';
import ProductDto from '../../dto/product-dto.ts';

export default class GetChangedProducts {
  constructor(private readonly storageService: StorageService) {}

  execute = async (storageId: string): Promise<ProductDto[]> => {
    return await this.storageService.getAllChangedProducts(storageId);
  };
}

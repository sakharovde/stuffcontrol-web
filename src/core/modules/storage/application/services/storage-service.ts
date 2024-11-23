import StorageRepository from '../../domain/repositories/storage-repository.ts';
import Storage from '../../domain/models/storage.ts';
import { v4 as uuidv4 } from 'uuid';
import StorageNameEmptySpecification from '../../domain/specifications/storage-name-empty-specification.ts';
import StorageWithProductsDto, { StorageWithProductsDtoFactory } from '../dto/storage-with-products-dto.ts';
import StorageItemRepository from '../../domain/repositories/storage-item-repository.ts';
import ProductRepository from '../../../product/domain/repositories/product-repository.ts';

export default class StorageService {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly storageItemRepository: StorageItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly nameEmptySpecification: StorageNameEmptySpecification
  ) {}

  async create(name: Storage['name']): Promise<Storage> {
    const isNameEmpty = await this.nameEmptySpecification.isSatisfiedBy(name);
    if (isNameEmpty) {
      throw new Error('Storage name cannot be empty');
    }

    const storage = new Storage(uuidv4(), name);

    return this.storageRepository.save(storage);
  }

  getAll(): Promise<Storage[]> {
    return this.storageRepository.getAll();
  }

  getAllWithProducts = async (): Promise<StorageWithProductsDto[]> => {
    const storages = await this.storageRepository.getAll();
    const storageItems = await this.storageItemRepository.getAll();
    const products = await this.productRepository.getAll();

    return storages.map((storage) => StorageWithProductsDtoFactory.create(storage, storageItems, products));
  };

  update(storage: Storage): Promise<Storage> {
    return this.storageRepository.save(storage);
  }

  remove(id: Storage['id']): Promise<void> {
    return this.storageRepository.remove(id);
  }
}

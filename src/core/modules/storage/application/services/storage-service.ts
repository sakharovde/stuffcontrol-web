import StorageRepository from '../../domain/repositories/storage-repository.ts';
import Storage from '../../domain/models/storage.ts';
import { v4 as uuidv4 } from 'uuid';
import StorageNameEmptySpecification from '../../domain/specifications/storage-name-empty-specification.ts';

export default class StorageService {
  constructor(
    private readonly storageRepository: StorageRepository,
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

  update(storage: Storage): Promise<Storage> {
    return this.storageRepository.save(storage);
  }

  remove(id: Storage['id']): Promise<void> {
    return this.storageRepository.remove(id);
  }
}

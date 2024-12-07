import { StorageRepository } from '../../../domain';
import StorageDto, { StorageDtoFactory } from '../../dto/storage-dto.ts';

export default class GetStoragesQueryHandler {
  constructor(private readonly storageRepository: StorageRepository) {}

  execute = async (): Promise<StorageDto[]> => {
    const storages = await this.storageRepository.getAll();

    return storages.map(StorageDtoFactory.create);
  };
}

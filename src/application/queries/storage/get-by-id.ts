import StorageDto, { StorageDtoFactory } from '../../dto/storage-dto.ts';
import { StorageRepository } from '../../../domain';

export default interface GetStorageByIdQuery {
  storageId: string;
}

export class GetStorageByIdQueryHandler {
  constructor(private storageRepository: StorageRepository) {}

  async execute(query: GetStorageByIdQuery): Promise<StorageDto | null> {
    const storage = await this.storageRepository.findById(query.storageId);

    if (!storage) {
      return null;
    }

    return StorageDtoFactory.create(storage);
  }
}

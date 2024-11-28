import { StorageDto, StorageService } from '../../../application';
import { StorageEventEmitter } from '../../../events';

export default class CreateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (name: StorageDto['name']): Promise<StorageDto> => {
    const result = await this.storageService.create(name);
    this.storageEventEmitter.emit('storageCreated');
    return result;
  };
}

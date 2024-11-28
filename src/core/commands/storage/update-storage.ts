import { StorageService } from '../../../application';
import { StorageEventBus } from '../../../events';
import { Storage } from '../../../domain';

export default class UpdateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (storage: Storage): Promise<Storage> => {
    const result = await this.storageService.update(storage);

    this.storageEventBus.emit('storageUpdated');

    return result;
  };
}

import { StorageService } from '../../../application';
import { StorageEventBus } from '../../../events';
import { Storage } from '../../../domain';

export default class CreateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (name: Storage['name']): Promise<Storage> => {
    const result = await this.storageService.create(name);
    this.storageEventBus.emit('storageCreated');
    return result;
  };
}

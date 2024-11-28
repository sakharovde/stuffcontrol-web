import { StorageService } from '../../../application';
import { StorageEventBus } from '../../../events';

export default class RemoveStorage {
  constructor(
    private storageService: StorageService,
    private readonly storageEventBus: StorageEventBus
  ) {}

  execute = async (id: Storage['id']): Promise<void> => {
    const result = await this.storageService.remove(id);
    this.storageEventBus.emit('storageDeleted');
    return result;
  };
}

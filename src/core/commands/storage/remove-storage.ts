import { StorageService } from '../../../application';
import { StorageEventEmitter } from '../../../events';

export default class RemoveStorage {
  constructor(
    private storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (id: Storage['id']): Promise<void> => {
    const result = await this.storageService.remove(id);
    this.storageEventEmitter.emit('storageDeleted');
    return result;
  };
}

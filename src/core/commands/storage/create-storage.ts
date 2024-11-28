import { StorageService } from '../../../application';
import { StorageEventEmitter } from '../../../events';
import { Storage } from '../../../domain';

export default class CreateStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (name: Storage['name']): Promise<Storage> => {
    const result = await this.storageService.create(name);
    this.storageEventEmitter.emit('storageCreated');
    return result;
  };
}

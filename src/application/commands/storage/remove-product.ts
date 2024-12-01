import { ProductDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export interface RemoveProductCommand {
  productId: ProductDto['id'];
}

export default class RemoveProductCommandHandler {
  constructor(
    private storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: RemoveProductCommand): Promise<void> => {
    const result = await this.storageService.removeProduct(command.productId);
    this.storageEventEmitter.emit('storageUpdated');
    return result;
  };
}

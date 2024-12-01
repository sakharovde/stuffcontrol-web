import { ProductDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export interface ChangeStorageProductQuantityCommand {
  productId: ProductDto['id'];
  quantity: ProductDto['quantity'];
  expirationDate?: Date;
}

export default class ChangeStorageProductQuantityCommandHandler {
  constructor(
    private readonly storageItemService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: ChangeStorageProductQuantityCommand): Promise<ProductDto> => {
    const result = await this.storageItemService.changeProductQuantity(
      command.productId,
      command.quantity,
      command.expirationDate
    );

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}

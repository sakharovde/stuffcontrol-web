import { StorageDto, ProductDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export interface AddNewProductToStorageCommand {
  storageId: StorageDto['id'];
  productName: ProductDto['name'];
  quantity: ProductDto['quantity'];
  expirationDate?: Date;
}

export default class AddNewProductToStorageCommandHandler {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (command: AddNewProductToStorageCommand): Promise<ProductDto> => {
    const result = await this.storageService.createProduct(
      command.storageId,
      command.productName,
      command.quantity,
      command.expirationDate
    );

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}

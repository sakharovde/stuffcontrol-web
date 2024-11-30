import { StorageDto, StorageProductDto, StorageService } from '../../index.ts';
import StorageEventEmitter from '../../events/storage-event-emitter.ts';

export default class AddNewProductToStorage {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageEventEmitter: StorageEventEmitter
  ) {}

  execute = async (args: {
    storageId: StorageDto['id'];
    productName: StorageProductDto['name'];
    quantity: StorageProductDto['quantity'];
  }): Promise<StorageProductDto> => {
    const result = await this.storageService.createProduct(args.storageId, args.productName, args.quantity);

    this.storageEventEmitter.emit('storageUpdated');

    return result;
  };
}

import StorageService from '../../services/storage.ts';
import Storage from '../../../domain/models/storage.ts';

export default class GetAllStoragesUseCase {
  constructor(private readonly storageService: StorageService) {}

  execute = (): Promise<Storage[]> => {
    return this.storageService.getAll();
  };
}

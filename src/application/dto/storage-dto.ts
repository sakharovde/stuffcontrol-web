import { Storage } from '../../domain';

export default interface StorageDto {
  id: Storage['id'];
  name: Storage['name'];
}

export class StorageDtoFactory {
  public static create = (storage: Storage): StorageDto => {
    return {
      id: storage.id,
      name: storage.name,
    };
  };
}

import { Storage } from '../../domain';

export default class StorageInstance {
  constructor(public readonly storageId: Storage['id']) {}
}

import Storage from '../models/storage.ts';

export default class StorageNameEmptySpecification {
  async isSatisfiedBy(name: Storage['name']): Promise<boolean> {
    return !name || !name.trim();
  }
}

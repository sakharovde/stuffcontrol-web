import StorageItem from '../models/storage-item.ts';

export default class ProductNameEmptySpecification {
  async isSatisfiedBy(name: StorageItem['name']): Promise<boolean> {
    return !name || !name.trim();
  }
}

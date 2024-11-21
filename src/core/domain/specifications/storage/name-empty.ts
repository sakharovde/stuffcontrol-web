export default class StorageNameEmptySpecification {
  async isSatisfiedBy(name: string): Promise<boolean> {
    return !name || !name.trim();
  }
}

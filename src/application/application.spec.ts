import Application from './application';

describe('Application', () => {
  let core: Application;

  beforeEach(() => {
    core = new Application();
  });

  describe('batch manager', () => {
    it('creates a new batch for a storage via the batch manager', async () => {
      const storage = await core.getStorageManager().createStorage({ name: 'storageName' });
      const batchManager = core.getBatchManager();

      const created = await batchManager.createBatch({
        storageId: storage.id,
        name: 'Bananas',
        quantity: 5,
        expirationDate: null,
      });

      expect(created).toEqual(
        expect.objectContaining({
          storageId: storage.id,
          name: 'Bananas',
          quantity: 5,
        })
      );
      expect(batchManager.getBatchById(created.id)).toEqual(created);
    });
  });

  describe('storage.create', () => {
    it('creates storage successfully', async () => {
      const storageManager = core.getStorageManager();
      const result = await storageManager.createStorage({ name: 'storageName' });

      expect(result).toEqual(
        expect.objectContaining({
          name: 'storageName',
        })
      );
    });

    it('throws an error when storage name is empty', async () => {
      await expect(core.getStorageManager().createStorage({ name: '' })).rejects.toThrow(
        'Storage name cannot be empty'
      );
    });
  });
});

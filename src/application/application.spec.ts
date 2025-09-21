import Application from './application';

describe('Application', () => {
  let core: Application;

  beforeEach(() => {
    core = new Application();
  });

  describe('product.addNewProduct', () => {
    it('adds a new product to storage successfully', async () => {
      const storage = await core.getStorageManager().createStorage({ name: 'storageName' });
      await core.commands.product.addNewProducts({
        storageId: storage.id,
        productName: 'productName',
        quantity: 0,
        expirationDate: null,
      });
      const result = await core.queries.batch.getByStorage({ storageId: storage.id }).then((batches) => batches[0]);

      expect(result).toEqual(
        expect.objectContaining({
          quantity: 0,
        })
      );
    });

    it('throws an error when product name is empty', async () => {
      await expect(
        core.commands.product.addNewProducts({
          storageId: 'storageId',
          productName: '',
          quantity: 0,
          expirationDate: null,
        })
      ).rejects.toThrow('Product name cannot be empty');
    });

    it('throws an error when quantity is negative', async () => {
      await expect(
        core.commands.product.addNewProducts({
          storageId: 'storageId',
          productName: 'productName',
          quantity: -1,
          expirationDate: null,
        })
      ).rejects.toThrow('Quantity cannot be negative');
    });

    // it('adds a new product with expiration date successfully', async () => {
    //   await core.commands.storage.create({ name: 'storageName' });
    //   const storage = await core.queries.storage.getAllWithProducts().then((storages) => storages[0]);
    //
    //   const expirationDate = new Date();
    //   await core.commands.product.addNewProduct({
    //     storageId: storage.id,
    //     productName: 'productName',
    //     quantity: 10,
    //     expirationDate,
    //   });
    //   const product = await core.queries.storage.getAllWithProducts().then((storages) => storages[0].products[0]);
    //   const productItems = await core.queries.productItem.getByProduct({ productId: product.id });
    //
    //   expect(productItems).toHaveLength(10);
    //   productItems.forEach((productItem) => {
    //     expect(productItem.expiredAt).toEqual(expirationDate);
    //   });
    // });
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

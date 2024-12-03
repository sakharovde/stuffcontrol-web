import Application from './application';

describe('Application', () => {
  let core: Application;

  beforeEach(() => {
    core = new Application();
  });

  describe('product.addNewProduct', () => {
    it('adds a new product to storage successfully', async () => {
      await core.commands.storage.create({ name: 'storageName' });
      const storage = await core.queries.storage.getAllWithProducts().then((storages) => storages[0]);
      await core.commands.product.addNewProduct({
        storageId: storage.id,
        productName: 'productName',
        quantity: 0,
        expirationDate: null,
      });
      const result = await core.queries.storage.getAllWithProducts().then((storages) => storages[0].products[0]);

      expect(result).toEqual(
        expect.objectContaining({
          quantity: 0,
        })
      );
    });

    it('throws an error when product name is empty', async () => {
      await expect(
        core.commands.product.addNewProduct({
          storageId: 'storageId',
          productName: '',
          quantity: 0,
          expirationDate: null,
        })
      ).rejects.toThrow('Product name cannot be empty');
    });

    it('throws an error when quantity is negative', async () => {
      await expect(
        core.commands.product.addNewProduct({
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
      await core.commands.storage.create({ name: 'storageName' });
      const result = await core.queries.storage.getAllWithProducts().then((storages) => storages[0]);
      expect(result).toEqual(
        expect.objectContaining({
          name: 'storageName',
        })
      );
    });

    it('throws an error when storage name is empty', async () => {
      await expect(core.commands.storage.create({ name: '' })).rejects.toThrow('Storage name cannot be empty');
    });
  });

  describe('user.register', () => {
    // it('registers a user successfully', async () => {
    //   const result = await core.commands.user.register({ username: 'testuser', password: 'password' });
    //   expect(result).toEqual(
    //     expect.objectContaining({
    //       username: 'testuser',
    //     })
    //   );
    // });

    it('throws an error when username is already taken', async () => {
      await core.commands.user.register({ username: 'testuser', password: 'password' });

      await expect(core.commands.user.register({ username: 'testuser', password: 'password' })).rejects.toThrow(
        'Username is already taken'
      );
    });

    it('throws an error when username is empty', async () => {
      await expect(core.commands.user.register({ username: '', password: 'password' })).rejects.toThrow(
        'Username cannot be empty'
      );
    });

    it('throws an error when password is empty', async () => {
      await expect(core.commands.user.register({ username: 'testuser', password: '' })).rejects.toThrow(
        'Password cannot be empty'
      );
    });
  });
});

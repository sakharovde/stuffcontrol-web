import Application from './application';

describe('Application', () => {
  let core: Application;

  beforeEach(() => {
    core = new Application();
  });

  describe('storage.addNewProduct', () => {
    it('adds a new product to storage successfully', async () => {
      const storage = await core.commands.storage.create.execute('storageName');
      const result = await core.commands.storage.addNewProduct.execute({
        storageId: storage.id,
        productName: 'productName',
        quantity: 10,
        shelfLife: null,
        shelfLifeAfterOpening: null,
        manufacturingDate: null,
      });
      expect(result).toEqual(
        expect.objectContaining({
          quantity: 0,
        })
      );
    });

    it('throws an error when product name is empty', async () => {
      await expect(
        core.commands.storage.addNewProduct.execute({
          storageId: 'storageId',
          productName: '',
          quantity: 10,
          shelfLife: null,
          shelfLifeAfterOpening: null,
          manufacturingDate: null,
        })
      ).rejects.toThrow('Product name cannot be empty');
    });

    it('throws an error when quantity is negative', async () => {
      await expect(
        core.commands.storage.addNewProduct.execute({
          storageId: 'storageId',
          productName: 'productName',
          quantity: -1,
          shelfLife: null,
          shelfLifeAfterOpening: null,
          manufacturingDate: null,
        })
      ).rejects.toThrow('Quantity cannot be negative');
    });
  });

  describe('storage.changeProductQuantity', () => {
    it('changes product quantity successfully', async () => {
      const storage = await core.commands.storage.create.execute('storageName');
      const product = await core.commands.storage.addNewProduct.execute({
        storageId: storage.id,
        productName: 'productName',
        quantity: 0,
        shelfLife: null,
        shelfLifeAfterOpening: null,
        manufacturingDate: null,
      });
      const result = await core.commands.storage.changeProductQuantity.execute({
        productId: product.id,
        quantity: 10,
      });
      expect(result).toEqual(
        expect.objectContaining({
          quantity: 0,
        })
      );
    });

    it('throws an error when quantity is negative', async () => {
      const storage = await core.commands.storage.create.execute('storageName');
      const product = await core.commands.storage.addNewProduct.execute({
        storageId: storage.id,
        productName: 'productName',
        quantity: 0,
        shelfLife: null,
        shelfLifeAfterOpening: null,
        manufacturingDate: null,
      });
      await expect(
        core.commands.storage.changeProductQuantity.execute({
          productId: product.id,
          quantity: -1,
        })
      ).rejects.toThrow('Quantity cannot be negative');
    });
  });

  describe('storage.create', () => {
    it('creates storage successfully', async () => {
      const result = await core.commands.storage.create.execute('storageName');
      expect(result).toEqual(
        expect.objectContaining({
          name: 'storageName',
        })
      );
    });

    it('throws an error when storage name is empty', async () => {
      await expect(core.commands.storage.create.execute('')).rejects.toThrow('Storage name cannot be empty');
    });
  });

  describe('user.register', () => {
    it('registers a user successfully', async () => {
      const result = await core.commands.user.register.execute('testuser', 'password');
      expect(result).toEqual(
        expect.objectContaining({
          username: 'testuser',
        })
      );
    });

    it('throws an error when username is already taken', async () => {
      await core.commands.user.register.execute('testuser', 'password');

      await expect(core.commands.user.register.execute('testuser', 'password')).rejects.toThrow(
        'Username is already taken'
      );
    });

    it('throws an error when username is empty', async () => {
      await expect(core.commands.user.register.execute('', 'password')).rejects.toThrow('Username cannot be empty');
    });

    it('throws an error when password is empty', async () => {
      await expect(core.commands.user.register.execute('testuser', '')).rejects.toThrow('Password cannot be empty');
    });
  });
});

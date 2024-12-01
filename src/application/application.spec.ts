import Application from './application';

describe('Application', () => {
  let core: Application;

  beforeEach(() => {
    core = new Application();
  });

  describe('storage.addNewProduct', () => {
    it('adds a new product to storage successfully', async () => {
      const storage = await core.commands.storage.create({ name: 'storageName' });
      const result = await core.commands.storage.addNewProduct({
        storageId: storage.id,
        productName: 'productName',
        quantity: 0,
      });
      expect(result).toEqual(
        expect.objectContaining({
          quantity: 0,
        })
      );
    });

    it('throws an error when product name is empty', async () => {
      await expect(
        core.commands.storage.addNewProduct({
          storageId: 'storageId',
          productName: '',
          quantity: 0,
        })
      ).rejects.toThrow('Product name cannot be empty');
    });

    it('throws an error when quantity is negative', async () => {
      await expect(
        core.commands.storage.addNewProduct({
          storageId: 'storageId',
          productName: 'productName',
          quantity: -1,
        })
      ).rejects.toThrow('Quantity cannot be negative');
    });
  });

  describe('storage.changeProductQuantity', () => {
    it('changes product quantity successfully', async () => {
      const storage = await core.commands.storage.create({ name: 'storageName' });
      const product = await core.commands.storage.addNewProduct({
        storageId: storage.id,
        productName: 'productName',
        quantity: 0,
      });
      const result = await core.commands.storage.changeProductQuantity({
        productId: product.id,
        quantity: 10,
      });
      expect(result).toEqual(
        expect.objectContaining({
          quantity: 10,
        })
      );
    });

    it('throws an error when quantity is negative', async () => {
      const storage = await core.commands.storage.create({ name: 'storageName' });
      const product = await core.commands.storage.addNewProduct({
        storageId: storage.id,
        productName: 'productName',
        quantity: 0,
      });
      await expect(
        core.commands.storage.changeProductQuantity({
          productId: product.id,
          quantity: -1,
        })
      ).rejects.toThrow('Quantity cannot be negative');
    });
  });

  describe('storage.create', () => {
    it('creates storage successfully', async () => {
      const result = await core.commands.storage.create({ name: 'storageName' });
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
    it('registers a user successfully', async () => {
      const result = await core.commands.user.register({ username: 'testuser', password: 'password' });
      expect(result).toEqual(
        expect.objectContaining({
          username: 'testuser',
        })
      );
    });

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

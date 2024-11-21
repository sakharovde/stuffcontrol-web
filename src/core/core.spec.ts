import Core from './core.ts';

describe('Core', () => {
  let core: Core;

  beforeEach(() => {
    core = new Core();
  });

  describe('storage.create', () => {
    it('creates storage successfully', async () => {
      const result = await core.useCases.storage.create.execute('storageName');
      expect(result).toEqual(
        expect.objectContaining({
          name: 'storageName',
        })
      );
    });

    it('throws an error when storage name is empty', async () => {
      await expect(core.useCases.storage.create.execute('')).rejects.toThrow('Storage name cannot be empty');
    });
  });

  describe('storage.addNewProduct', () => {
    it('adds a new product to storage successfully', async () => {
      const result = await core.useCases.storage.addNewProduct.execute('storageId', 'productName', 10);
      expect(result).toEqual(
        expect.objectContaining({
          quantity: 10,
        })
      );
    });

    it('throws an error when product name is empty', async () => {
      await expect(core.useCases.storage.addNewProduct.execute('storageId', '', 10)).rejects.toThrow(
        'Product name cannot be empty'
      );
    });

    it('throws an error when quantity is negative', async () => {
      await expect(core.useCases.storage.addNewProduct.execute('storageId', 'productName', -1)).rejects.toThrow(
        'Quantity cannot be negative'
      );
    });
  });

  describe('user.register', () => {
    it('registers a user successfully', async () => {
      const result = await core.useCases.user.register.execute('testuser', 'password');
      expect(result).toEqual(
        expect.objectContaining({
          username: 'testuser',
        })
      );
    });

    it('throws an error when username is already taken', async () => {
      await core.useCases.user.register.execute('testuser', 'password');

      await expect(core.useCases.user.register.execute('testuser', 'password')).rejects.toThrow(
        'Username is already taken'
      );
    });

    it('throws an error when username is empty', async () => {
      await expect(core.useCases.user.register.execute('', 'password')).rejects.toThrow('Username cannot be empty');
    });

    it('throws an error when password is empty', async () => {
      await expect(core.useCases.user.register.execute('testuser', '')).rejects.toThrow('Password cannot be empty');
    });
  });
});

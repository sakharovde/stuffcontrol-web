import { StorageTransaction } from '../../../domain';
import StorageTransactionMapper from './storage-transaction';

describe('StorageTransactionMapper', () => {
  describe('toPersistence', () => {
    it('converts a StorageTransaction to persistence format', () => {
      const storageTransaction = new StorageTransaction(
        '1',
        'storage1',
        'product1',
        10,
        'pending',
        new Date('2023-01-01')
      );
      const result = StorageTransactionMapper.toPersistence(storageTransaction);
      expect(result).toEqual({
        id: '1',
        storageId: 'storage1',
        productId: 'product1',
        quantityChange: 10,
        state: 'pending',
        createdAt: '2023-01-01T00:00:00.000Z',
      });
    });
  });

  describe('toDomain', () => {
    it('converts valid data to a StorageTransaction', () => {
      const data = {
        id: '1',
        storageId: 'storage1',
        productId: 'product1',
        quantityChange: 10,
        state: 'pending',
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      const result = StorageTransactionMapper.toDomain(data);
      expect(result).toBeInstanceOf(StorageTransaction);
      expect(result).toEqual(
        new StorageTransaction('1', 'storage1', 'product1', 10, 'pending', new Date('2023-01-01'))
      );
    });

    it('throws an error when data is invalid', () => {
      const invalidData = {
        id: '1',
        storageId: 'storage1',
        productId: 'product1',
        quantityChange: 10,
        state: 'pending',
      };
      expect(() => StorageTransactionMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when data is null', () => {
      expect(() => StorageTransactionMapper.toDomain(null)).toThrow('Invalid data');
    });

    it('throws an error when data is not an object', () => {
      expect(() => StorageTransactionMapper.toDomain('invalid')).toThrow('Invalid data');
    });

    it('throws an error when state is not valid', () => {
      const invalidData = {
        id: '1',
        storageId: 'storage1',
        productId: 'product1',
        quantityChange: 10,
        state: 'invalid',
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      expect(() => StorageTransactionMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when createdAt is not a string', () => {
      const invalidData = {
        id: '1',
        storageId: 'storage1',
        productId: 'product1',
        quantityChange: 10,
        state: 'pending',
        createdAt: 12345,
      };
      expect(() => StorageTransactionMapper.toDomain(invalidData)).toThrow('Invalid data');
    });
  });
});

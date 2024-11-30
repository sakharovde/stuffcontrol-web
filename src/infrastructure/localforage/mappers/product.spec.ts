import { Product } from '../../../domain';
import ProductMapper from './product';

describe('ProductMapper', () => {
  describe('toPersistence', () => {
    it('converts a Product to persistence format', () => {
      const product = new Product('1', 'storage1', 'product1', new Date('2023-01-01'));
      const result = ProductMapper.toPersistence(product);
      expect(result).toEqual({
        id: '1',
        storageId: 'storage1',
        name: 'product1',
        createdAt: '2023-01-01T00:00:00.000Z',
      });
    });
  });

  describe('toDomain', () => {
    it('converts valid data to a Product', () => {
      const data = {
        id: '1',
        storageId: 'storage1',
        name: 'product1',
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      const result = ProductMapper.toDomain(data);
      expect(result).toBeInstanceOf(Product);
      expect(result).toEqual(new Product('1', 'storage1', 'product1', new Date('2023-01-01')));
    });

    it('throws an error when data is invalid', () => {
      const invalidData = { id: '1', storageId: 'storage1', name: 'product1', quantity: 10 };
      expect(() => ProductMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when data is null', () => {
      expect(() => ProductMapper.toDomain(null)).toThrow('Invalid data');
    });

    it('throws an error when data is not an object', () => {
      expect(() => ProductMapper.toDomain('invalid')).toThrow('Invalid data');
    });

    it('throws an error when createdAt is not a string', () => {
      const invalidData = {
        id: '1',
        storageId: 'storage1',
        name: 'product1',
        quantity: 10,
        createdAt: 12345,
      };
      expect(() => ProductMapper.toDomain(invalidData)).toThrow('Invalid data');
    });
  });
});

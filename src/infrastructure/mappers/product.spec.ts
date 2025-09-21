import Product from '../../domain/entities/product.ts';
import ProductMapper from './product.ts';

describe('ProductMapper', () => {
  describe('toDomain', () => {
    it('converts valid data to a Product', () => {
      const data = {
        id: '1',
        storageId: 'storage1',
        name: 'name1',
        expirationDate: null,
        addedAt: '2023-01-01T00:00:00.000Z',
        removedAt: null,
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      const result = ProductMapper.toDomain(data);
      expect(result).toBeInstanceOf(Product);
      expect(result).toEqual(
        new Product(
          '1',
          'storage1',
          'name1',
          null,
          null,
          new Date('2023-01-01T00:00:00.000Z'),
          new Date('2023-01-01T00:00:00.000Z')
        )
      );
    });

    it('throws an error when data is invalid', () => {
      const invalidData = { id: '1', storageId: 'storage1', addedAt: 'invalid', removedAt: null, createdAt: 'invalid' };
      expect(() => ProductMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when data is null', () => {
      expect(() => ProductMapper.toDomain(null)).toThrow('Invalid data');
    });

    it('throws an error when data is not an object', () => {
      expect(() => ProductMapper.toDomain('invalid')).toThrow('Invalid data');
    });

    it('throws an error when addedAt is not a valid date string', () => {
      const invalidData = {
        id: '1',
        storageId: 'storage1',
        name: 'name1',
        addedAt: 'invalid',
        removedAt: null,
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      expect(() => ProductMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when removedAt is not a valid date string or null', () => {
      const invalidData = {
        id: '1',
        storageId: 'storage1',
        name: 'name1',
        addedAt: '2023-01-01T00:00:00.000Z',
        removedAt: 'invalid',
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      expect(() => ProductMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when createdAt is not a valid date string', () => {
      const invalidData = {
        id: '1',
        storageId: 'storage1',
        name: 'name1',
        addedAt: '2023-01-01T00:00:00.000Z',
        removedAt: null,
        createdAt: 'invalid',
      };
      expect(() => ProductMapper.toDomain(invalidData)).toThrow('Invalid data');
    });
  });

  describe('toPersistence', () => {
    it('converts a Product to persistence format', () => {
      const productItem = new Product(
        '1',
        'storage1',
        'name1',
        null,
        null,
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z')
      );
      const result = ProductMapper.toPersistence(productItem);
      expect(result).toEqual({
        id: '1',
        storageId: 'storage1',
        name: 'name1',
        expirationDate: null,
        addedAt: '2023-01-01T00:00:00.000Z',
        removedAt: null,
        createdAt: '2023-01-01T00:00:00.000Z',
      });
    });
  });
});

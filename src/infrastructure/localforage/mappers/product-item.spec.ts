import ProductItem from '../../../domain/models/product-item.ts';
import ProductItemMapper from './product-item.ts';

describe('ProductItemMapper', () => {
  describe('toDomain', () => {
    it('converts valid data to a ProductItem', () => {
      const data = {
        id: '1',
        productId: 'product1',
        addedAt: '2023-01-01T00:00:00.000Z',
        removedAt: null,
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      const result = ProductItemMapper.toDomain(data);
      expect(result).toBeInstanceOf(ProductItem);
      expect(result).toEqual(
        new ProductItem(
          '1',
          'product1',
          null,
          new Date('2023-01-01T00:00:00.000Z'),
          new Date('2023-01-01T00:00:00.000Z')
        )
      );
    });

    it('throws an error when data is invalid', () => {
      const invalidData = { id: '1', productId: 'product1', addedAt: 'invalid', removedAt: null, createdAt: 'invalid' };
      expect(() => ProductItemMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when data is null', () => {
      expect(() => ProductItemMapper.toDomain(null)).toThrow('Invalid data');
    });

    it('throws an error when data is not an object', () => {
      expect(() => ProductItemMapper.toDomain('invalid')).toThrow('Invalid data');
    });

    it('throws an error when addedAt is not a valid date string', () => {
      const invalidData = {
        id: '1',
        productId: 'product1',
        addedAt: 'invalid',
        removedAt: null,
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      expect(() => ProductItemMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when removedAt is not a valid date string or null', () => {
      const invalidData = {
        id: '1',
        productId: 'product1',
        addedAt: '2023-01-01T00:00:00.000Z',
        removedAt: 'invalid',
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      expect(() => ProductItemMapper.toDomain(invalidData)).toThrow('Invalid data');
    });

    it('throws an error when createdAt is not a valid date string', () => {
      const invalidData = {
        id: '1',
        productId: 'product1',
        addedAt: '2023-01-01T00:00:00.000Z',
        removedAt: null,
        createdAt: 'invalid',
      };
      expect(() => ProductItemMapper.toDomain(invalidData)).toThrow('Invalid data');
    });
  });

  describe('toPersistence', () => {
    it('converts a ProductItem to persistence format', () => {
      const productItem = new ProductItem(
        '1',
        'product1',
        null,
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z')
      );
      const result = ProductItemMapper.toPersistence(productItem);
      expect(result).toEqual({
        id: '1',
        productId: 'product1',
        addedAt: '2023-01-01T00:00:00.000Z',
        removedAt: null,
        createdAt: '2023-01-01T00:00:00.000Z',
      });
    });
  });
});

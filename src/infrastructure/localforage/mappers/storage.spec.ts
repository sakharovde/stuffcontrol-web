import { Storage } from '../../../domain';
import StorageMapper from './storage';

describe('StorageMapper', () => {
  describe('toPersistence', () => {
    it('converts a Storage to persistence format', () => {
      const storage = new Storage('1', 'storageName');
      const result = StorageMapper.toPersistence(storage);
      expect(result).toEqual({
        id: '1',
        name: 'storageName',
      });
    });
  });

  describe('toDomain', () => {
    it('converts valid data to a Storage', () => {
      const data = {
        id: '1',
        name: 'storageName',
      };
      const result = StorageMapper.toDomain(data);
      expect(result).toBeInstanceOf(Storage);
      expect(result).toEqual(new Storage('1', 'storageName'));
    });

    it('throws an error when data is invalid', () => {
      const invalidData = { id: '1' };
      expect(() => StorageMapper.toDomain(invalidData)).toThrow('Invalid name');
    });

    it('throws an error when data is null', () => {
      expect(() => StorageMapper.toDomain(null)).toThrow('Invalid data');
    });

    it('throws an error when data is not an object', () => {
      expect(() => StorageMapper.toDomain('invalid')).toThrow('Invalid data');
    });

    it('throws an error when id is not a string', () => {
      const invalidData = {
        id: 1,
        name: 'storageName',
      };
      expect(() => StorageMapper.toDomain(invalidData)).toThrow('Invalid id');
    });

    it('throws an error when name is not a string', () => {
      const invalidData = {
        id: '1',
        name: 123,
      };
      expect(() => StorageMapper.toDomain(invalidData)).toThrow('Invalid name');
    });
  });
});

import BatchMapper from './batch-mapper.ts';
import { Batch } from '../../domain';

describe('BatchMapper.toDomain', () => {
  it('converts valid data to a Batch', () => {
    const data = {
      id: '1',
      storageId: 'storage1',
      name: 'product1',
      quantity: 10,
      expirationDate: '2023-12-31T00:00:00.000Z',
      createdAt: '2023-01-01T00:00:00.000Z',
    };
    const result = BatchMapper.toDomain(data);
    expect(result).toBeInstanceOf(Batch);
    expect(result).toEqual(
      new Batch(
        '1',
        'storage1',
        'product1',
        10,
        new Date('2023-12-31T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z')
      )
    );
  });

  it('returns null when data is null', () => {
    const result = BatchMapper.toDomain(null);
    expect(result).toBeNull();
  });

  it('returns null when data is not an object', () => {
    const result = BatchMapper.toDomain('invalid');
    expect(result).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    const data = { id: '1' };
    const result = BatchMapper.toDomain(data);
    expect(result).toBeNull();
  });

  it('sets default values for optional fields', () => {
    const data = {
      id: '1',
      storageId: 'storage1',
      name: 'product1',
      createdAt: '2023-01-01T00:00:00.000Z',
    };
    const result = BatchMapper.toDomain(data);
    expect(result).toEqual(new Batch('1', 'storage1', 'product1', 0, null, new Date('2023-01-01T00:00:00.000Z')));
  });

  it('parses valid date strings correctly', () => {
    const data = {
      id: '1',
      storageId: 'storage1',
      name: 'product1',
      expirationDate: '2023-12-31T00:00:00.000Z',
      createdAt: '2023-01-01T00:00:00.000Z',
    };
    const result = BatchMapper.toDomain(data);
    expect(result?.expirationDate).toEqual(new Date('2023-12-31T00:00:00.000Z'));
    expect(result?.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
  });

  it('returns null for invalid date strings', () => {
    const data = {
      id: '1',
      storageId: 'storage1',
      name: 'product1',
      expirationDate: 'invalid',
      createdAt: 'invalid',
    };
    const result = BatchMapper.toDomain(data);
    expect(result?.expirationDate).toBeNull();
    expect(result?.createdAt).toEqual(new Date());
  });
});

describe('BatchMapper.toPersistence', () => {
  it('converts a Batch to persistence format', () => {
    const batch = new Batch(
      '1',
      'storage1',
      'product1',
      10,
      new Date('2023-12-31T00:00:00.000Z'),
      new Date('2023-01-01T00:00:00.000Z')
    );
    const result = BatchMapper.toPersistence(batch);
    expect(result).toEqual({
      id: '1',
      storageId: 'storage1',
      name: 'product1',
      quantity: 10,
      expirationDate: '2023-12-31T00:00:00.000Z',
      createdAt: '2023-01-01T00:00:00.000Z',
    });
  });

  it('handles null expirationDate correctly', () => {
    const batch = new Batch('1', 'storage1', 'product1', 10, null, new Date('2023-01-01T00:00:00.000Z'));
    const result = BatchMapper.toPersistence(batch);
    expect(result).toEqual({
      id: '1',
      storageId: 'storage1',
      name: 'product1',
      quantity: 10,
      expirationDate: null,
      createdAt: '2023-01-01T00:00:00.000Z',
    });
  });
});

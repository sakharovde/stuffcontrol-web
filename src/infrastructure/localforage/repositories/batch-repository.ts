import { Batch, BatchRepository } from '../../../domain';
import LocalForageFactory from '../localforage-factory.ts';
import BatchMapper from '../mappers/batch-mapper.ts';

export default class BatchRepositoryImpl implements BatchRepository {
  private readonly client = LocalForageFactory.createInstance({
    name: 'batches',
    storeName: 'v1',
    description: 'Database for storage items',
  });

  findAll = async (): Promise<Batch[]> => {
    const batches: Batch[] = [];

    await this.client.iterate((value) => {
      const batch = BatchMapper.toDomain(value);

      if (batch) batches.push(batch);
    });

    return batches;
  };

  findAllByStorageId = async (storageId: Batch['storageId']): Promise<Batch[]> => {
    const batches = await this.findAll();

    return batches.filter((batch) => batch.storageId === storageId);
  };

  findById = async (id: Batch['id']): Promise<Batch | null> => {
    return this.client.getItem(id).then((data) => BatchMapper.toDomain(data));
  };

  save = async (batch: Batch): Promise<void> => {
    await this.client.setItem(batch.id, BatchMapper.toPersistence(batch));
  };

  delete = async (id: Batch['id']): Promise<void> => {
    await this.client.removeItem(id);
  };
}

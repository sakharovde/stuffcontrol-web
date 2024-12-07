import { BatchRepository } from '../../../domain';
import BatchDto, { BatchDtoFactory } from '../../dto/batch-dto.ts';

export default interface GetBatchesByStorageQuery {
  storageId: string;
}

export class GetBatchesByStorageQueryHandler {
  constructor(private readonly batchRepository: BatchRepository) {}

  execute = async (query: GetBatchesByStorageQuery): Promise<BatchDto[]> => {
    const batches = await this.batchRepository.findAllByStorageId(query.storageId);

    return batches.map(BatchDtoFactory.create);
  };
}

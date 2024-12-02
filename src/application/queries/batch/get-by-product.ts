import { BatchRepository } from '../../../domain';
import BatchDto, { BatchDtoFactory } from '../../dto/batch-dto.ts';

export default interface GetBatchesByProductQuery {
  productId: string;
}

export class GetBatchesByProductQueryHandler {
  constructor(private readonly batchRepository: BatchRepository) {}

  execute = async (query: GetBatchesByProductQuery): Promise<BatchDto[]> => {
    const batches = await this.batchRepository.findAllByProductId(query.productId);

    return batches.map(BatchDtoFactory.create);
  };
}

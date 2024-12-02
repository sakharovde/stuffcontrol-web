import BatchService from '../../services/batch-service.ts';
import BatchDto from '../../dto/batch-dto.ts';
import BatchEventEmitter from '../../events/batch-event-emitter.ts';

export interface ChangeBatchQuantityCommand {
  batchId: BatchDto['id'];
  quantity: BatchDto['quantity'];
}

export default class ChangeBatchQuantityCommandHandler {
  constructor(
    private readonly batchEventEmitter: BatchEventEmitter,
    private readonly batchService: BatchService
  ) {}

  execute = async (command: ChangeBatchQuantityCommand): Promise<void> => {
    await this.batchService.changeQuantity(command.batchId, command.quantity);

    this.batchEventEmitter.emit('batchUpdated');
  };
}

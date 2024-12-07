import { Batch } from '../../domain';

export default interface BatchDto {
  readonly id: Batch['id'];
  readonly storageId: Batch['storageId'];
  readonly name: Batch['name'];
  readonly quantity: Batch['quantity'];
  readonly expirationDate: Batch['expirationDate'];
}

export class BatchDtoFactory {
  static create(batch: Batch): BatchDto {
    return {
      id: batch.id,
      storageId: batch.storageId,
      name: batch.name,
      quantity: batch.quantity,
      expirationDate: batch.expirationDate,
    };
  }
}

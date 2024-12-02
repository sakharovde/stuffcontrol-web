import { Batch } from '../../domain';

export default interface BatchDto {
  readonly id: Batch['id'];
  readonly productId: Batch['productId'];
  readonly quantity: Batch['quantity'];
  readonly expirationDate: Batch['expirationDate'];
}

export class BatchDtoFactory {
  static create(batch: Batch): BatchDto {
    return {
      id: batch.id,
      productId: batch.productId,
      quantity: batch.quantity,
      expirationDate: batch.expirationDate,
    };
  }
}

import { UUID } from './types/uuid.ts';

export default class Product {
  constructor(
    public readonly id: UUID,
    public readonly storageId: UUID,

    public name: string,

    public expirationDate: Date | null = null,

    public removedAt: Date | null = null,
    public readonly addedAt: Date = new Date(),
    public readonly createdAt: Date = new Date()
  ) {}
}

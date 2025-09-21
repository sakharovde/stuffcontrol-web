import { UUID } from './types/uuid.ts';

export default class Storage {
  constructor(
    public readonly id: UUID,
    public name: string
  ) {}
}

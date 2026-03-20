import Transaction from '../entities/transaction.ts';

export default interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  getAll(): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<Transaction>;
  remove(id: Transaction['id']): Promise<void>;
}

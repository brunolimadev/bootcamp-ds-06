import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO
    const transactionRepository = getRepository(Transaction);

    const transactions = await transactionRepository.find();

    const income = transactions
      .map(transaction =>
        transaction.type === 'income' ? transaction.value : 0,
      )
      .reduce((actualy, tt) => {
        return actualy + tt;
      }, 0);

    const outcome = transactions
      .map(transaction =>
        transaction.type === 'outcome' ? transaction.value : 0,
      )
      .reduce((actualy, tt) => {
        return actualy + tt;
      }, 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;

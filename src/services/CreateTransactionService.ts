import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  nameCategory: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    nameCategory,
  }: Request): Promise<Transaction> {
    // TODO

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (total < value && type === 'outcome') {
      throw new AppError('Your total is less than outcome value', 400);
    }

    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository.findOne({
      where: {
        title: nameCategory,
      },
    });

    const categoryId = { id: categoryExists?.id };

    if (!categoryExists) {
      const category = categoryRepository.create({
        title: nameCategory,
      });

      await categoryRepository.save(category);

      categoryId.id = category.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryId.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

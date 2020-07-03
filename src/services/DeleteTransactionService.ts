import { getRepository } from 'typeorm';
import { isUuid } from 'uuidv4';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    // TODO

    if (!isUuid(id)) {
      throw new AppError('Id invalid', 400);
    }

    const transactionRepository = getRepository(Transaction);

    const transaction = await transactionRepository.findOne({
      where: {
        id,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;

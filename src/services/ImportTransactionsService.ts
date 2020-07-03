import { getRepository, getCustomRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import configUpload from '../config/upload';

import TransactionRepository from '../repositories/TransactionsRepository';

interface CTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    // TODO

    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const csvFilePath = path.join(
      configUpload.directory,
      'import_template.csv',
    );

    // criação da stream de leitura
    const readCSVStream = fs.createReadStream(csvFilePath);

    // criação da outra stream de leitura
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    // pipe é um método presente em toda stream que simplesmente transmite a informação de uma stream pra outra
    // neste caso estamos transmitindo a informação do arquivo para a variável parseCSV
    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CTransaction[] = [];
    const categories: string[] = [];

    // Começa a transferência dos dados
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      categories.push(category);

      transactions.push({
        title,
        type,
        value,
        category,
      });
    });

    // Finaliza a transferência
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existsCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existsCategoriesTitles = existsCategories.map(
      (category: Category) => category.title,
    );

    const nonExistsCategoriesTitles = categories
      .filter(category => {
        return !existsCategoriesTitles.includes(category);
      })
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

    const newCategories = await categoryRepository.create(
      nonExistsCategoriesTitles.map(title => {
        return {
          title,
        };
      }),
    );

    await categoryRepository.save(newCategories);

    const totalCategories = [...newCategories, ...existsCategories];

    const addTransactions = await transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: totalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(addTransactions);

    return addTransactions;
  }
}

export default ImportTransactionsService;

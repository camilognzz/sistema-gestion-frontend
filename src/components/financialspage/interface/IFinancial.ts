export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface ITransactionCategory {
  id: number;
  name: string;
  description?: string;
}

export interface IFinancialTransaction {
  id?: number;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  transactionDate: string;
}

export interface IFinancialTransactionDTO {
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryId: number;
  transactionDate: string;
}

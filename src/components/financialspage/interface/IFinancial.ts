// src/financepage/interface/IFinancialTransaction.ts

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
    transactionDate: string; // Formato ISO: "YYYY-MM-DD"
  }
  
  export interface IFinancialTransactionDTO {
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    categoryId: number;
    transactionDate: string; // Formato ISO: "YYYY-MM-DD"
  }
  

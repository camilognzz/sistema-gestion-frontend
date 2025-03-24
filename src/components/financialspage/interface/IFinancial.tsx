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
    id?: number; // Opcional porque se genera en el backend
    description: string;
    amount: number;
    type: TransactionType;
    category?: ITransactionCategory; // Puede ser null o undefined si no tiene categoría
    transactionDate: string; // Usamos string para fechas en formato ISO (ej. "2025-03-22")
  }
  
  // DTO para enviar al backend (similar a TransactionDTO en Java)
  export interface IFinancialTransactionDTO {
    description: string;
    amount: number;
    type: TransactionType;
    categoryId: number; // ID de la categoría, ya que el backend espera un ID
    transactionDate: string;
  }
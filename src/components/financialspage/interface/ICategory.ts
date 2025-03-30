// src/financialspage/interface/IFinancial.ts
export interface ITransactionCategory {
    id?: number; // Opcional porque se genera en el backend
    name: string;
    description?: string | null;
  }
  
  // DTO para enviar al backend (coincide con CategoryDTO en Java)
  export interface ICategoryDTO {
    name: string;
    description?: string | null;
  }
  
  // ... (otras interfaces como IFinancialTransaction, etc.)
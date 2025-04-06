export interface ITransactionCategory {
  id?: number;
  name: string;
  description?: string | null;
}

export interface ICategoryDTO {
  name: string;
  description?: string | null;
}

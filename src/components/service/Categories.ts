import axios from "axios";
import {
  ITransactionCategory,
  ICategoryDTO,
} from "../financialspage/interface/ICategory";

class Categories {
  private static readonly BASE_URL = "http://localhost:8080/api/categories";

  static async getAllCategories(
    token: string
  ): Promise<ITransactionCategory[]> {
    try {
      const response = await axios.get<ITransactionCategory[]>(this.BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  static async getCategoryById(
    id: number,
    token: string
  ): Promise<ITransactionCategory | null> {
    try {
      const response = await axios.get<ITransactionCategory>(
        `${this.BASE_URL}/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  static async createCategory(
    categoryData: ICategoryDTO,
    token: string
  ): Promise<ITransactionCategory> {
    try {
      const response = await axios.post<ITransactionCategory>(
        `${this.BASE_URL}`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async updateCategory(
    categoryId: number,
    categoryData: ICategoryDTO,
    token: string
  ): Promise<ITransactionCategory> {
    try {
      const response = await axios.put<ITransactionCategory>(
        `${this.BASE_URL}/${categoryId}`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async deleteCategory(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private static handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      console.error("❌ Error en la petición:", {
        status: error.response?.status,
        data: error.response?.data,
        message,
      });
      throw new Error(message);
    } else {
      console.error("❌ Error desconocido:", error);
      throw new Error("Error desconocido");
    }
  }
}

export default Categories;

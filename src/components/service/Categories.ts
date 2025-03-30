// src/service/Categories.ts
import axios from "axios";
import { ITransactionCategory, ICategoryDTO } from "../financialspage/interface/ICategory";

class Categories {
  private static readonly BASE_URL = "http://localhost:8080/api/categories";

  /** 🔹 Obtener todas las categorías */
  static async getAllCategories(token: string): Promise<ITransactionCategory[]> {
    try {
      const response = await axios.get<ITransactionCategory[]>(this.BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Categorías obtenidas:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /** 🔹 Obtener una categoría por ID */
  static async getCategoryById(id: number, token: string): Promise<ITransactionCategory | null> {
    try {
      const response = await axios.get<ITransactionCategory>(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Categoría obtenida:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  /** 🔹 Crear una categoría */
  static async createCategory(categoryData: ICategoryDTO, token: string): Promise<ITransactionCategory> {
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
      console.log("Categoría creada:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Actualizar una categoría */
  static async updateCategory(
    categoryId: number,
    categoryData: ICategoryDTO,
    token: string
  ): Promise<ITransactionCategory> {
    try {
      console.log("Enviando solicitud de actualización de datos:", categoryData);
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
      console.log("Respuesta del servidor:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Eliminar una categoría */
  static async deleteCategory(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Categoría con ID ${id} eliminada`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Función auxiliar para manejar errores */
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
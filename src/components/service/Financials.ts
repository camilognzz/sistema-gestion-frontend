import axios from "axios";
import {
  IFinancialTransaction,
  IFinancialTransactionDTO,
} from "../financialspage/interface/IFinancial";

class Financials {
  private static readonly BASE_URL = "http://localhost:8080/api/financial";

  /** 🔹 Obtener todas las transacciones por rango de fechas */
  static async getTransactionsByDateRange(
    start: string,
    end: string,
    token: string
  ): Promise<IFinancialTransaction[]> {
    try {
      const response = await axios.get<IFinancialTransaction[]>(
        `${this.BASE_URL}/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            start,
            end,
          },
        }
      );
      console.log("Transacciones obtenidas:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /** 🔹 Obtener el balance actual */
  static async getCurrentBalance(token: string): Promise<number> {
    try {
      const response = await axios.get<number>(`${this.BASE_URL}/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Balance actual obtenido:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return 0; // Valor por defecto en caso de error
    }
  }

  /** 🔹 Crear una transacción */
  static async createTransaction(
    transactionData: IFinancialTransactionDTO,
    token: string
  ): Promise<IFinancialTransaction> {
    try {
      const response = await axios.post<IFinancialTransaction>(
        `${this.BASE_URL}/transactions`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Transacción creada:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Actualizar una transacción */
  static async updateTransaction(
    id: number,
    transactionData: IFinancialTransactionDTO,
    token: string
  ): Promise<IFinancialTransaction> {
    try {
      const response = await axios.put<IFinancialTransaction>(
        `${this.BASE_URL}/transactions/${id}`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Transacción actualizada:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Eliminar una transacción */
  static async deleteTransaction(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Transacción con ID ${id} eliminada`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Obtener una transacción por ID */
  static async getTransactionById(id: number, token: string): Promise<IFinancialTransaction> {
    try {
      const response = await axios.get<IFinancialTransaction>(
        `${this.BASE_URL}/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Transacción obtenida por ID:", response.data);
      return response.data;
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

export default Financials;
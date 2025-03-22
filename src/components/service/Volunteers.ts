import axios from "axios";
import { IVoluntario } from "../volunteerspage/interface/IVoluntario";

class Volunteers {
  private static readonly BASE_URL = "http://localhost:8080/api/v1/voluntarios";
  /** 🔹 Obtener todos los voluntarios */

  static async getAllVolunteers(token: string): Promise<IVoluntario[]> {
    try {
      const response = await axios.get<IVoluntario[]>(this.BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Voluntarios obtenidos:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /** 🔹 Obtener un Voluntario por ID */
  static async getVolunteerById(
    id: number,
    token: string
  ): Promise<IVoluntario | null> {
    try {
      const response = await axios.get<IVoluntario>(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Voluntario obtenido:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  /** 🔹 Crear un voluntario */
  static async createVolunteer(
    volunteerData: IVoluntario,
    token: string
  ): Promise<IVoluntario> {
    try {
      const response = await axios.post<IVoluntario>(
        `${Volunteers.BASE_URL}`,
        volunteerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Voluntario creado:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Eliminar un voluntario */
  static async deleteVolunteer(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Voluntario con ID ${id} eliminado`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Actualizar un voluntario (Alineado con IVoluntario.ts) */
  static async updateVolunteer(
    volunteerId: number,
    volunteerData: IVoluntario,
    token: string
  ): Promise<IVoluntario> {
    try {
      console.log(
        "Enviando Solicitud de actualizacion de datos:",
        volunteerData
      );
      const response = await axios.put<IVoluntario>(
        `${this.BASE_URL}/${volunteerId}`,
        volunteerData,
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

  /** 🔹 Función auxiliar para manejar errores (Alineado con Users.ts) */
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

export default Volunteers;

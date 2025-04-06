import axios from "axios";
import { IVoluntario } from "../volunteerspage/interface/IVoluntario";

class Volunteers {
  private static readonly BASE_URL = "http://localhost:8080/api/v1/voluntarios";

  static async getAllVolunteers(token: string): Promise<IVoluntario[]> {
    try {
      const response = await axios.get<IVoluntario[]>(this.BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  static async getVolunteerById(
    id: number,
    token: string
  ): Promise<IVoluntario | null> {
    try {
      const response = await axios.get<IVoluntario>(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

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
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async deleteVolunteer(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async updateVolunteer(
    volunteerId: number,
    volunteerData: IVoluntario,
    token: string
  ): Promise<IVoluntario> {
    try {
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
      return response.data;
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

export default Volunteers;

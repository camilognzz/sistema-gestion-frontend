import axios from "axios";
import { IContacto } from "../contactspage/interface/IContacto";

class Contacts {
  private static readonly BASE_URL =
    "http://localhost:8080/api/v1/contactos-estrategicos";

  static async getAllContacts(token: string): Promise<IContacto[]> {
    try {
      const response = await axios.get<IContacto[]>(this.BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  static async getContactById(
    id: number,
    token: string
  ): Promise<IContacto | null> {
    try {
      const response = await axios.get<IContacto>(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  static async createContact(
    contactData: IContacto,
    token: string
  ): Promise<IContacto> {
    try {
      const response = await axios.post<IContacto>(
        `${Contacts.BASE_URL}`,
        contactData,
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
  static async deleteContact(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async updateContact(
    contactId: number,
    contactData: IContacto,
    token: string
  ): Promise<IContacto> {
    try {
      const response = await axios.put<IContacto>(
        `${this.BASE_URL}/${contactId}`,
        contactData,
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

export default Contacts;

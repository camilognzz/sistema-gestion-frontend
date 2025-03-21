import axios from "axios";
import { IContacto } from "../contactspage/interface/IContacto";

class Contacts {
  private static readonly BASE_URL =
    "http://localhost:8080/api/v1/contactos-estrategicos";

  /** 🔹 Obtener todos los contactos */
  static async getAllContacts(token: string): Promise<IContacto[]> {
    try {
      const response = await axios.get<IContacto[]>(this.BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Contactos obtenidos:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /** 🔹 Obtener un proyecto por ID */
  static async getContactById(
    id: number,
    token: string
  ): Promise<IContacto | null> {
    try {
      const response = await axios.get<IContacto>(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Contacto obtenido:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  /** 🔹 Crear un contacto */
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
      console.log("Contacto creado:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  /** 🔹 Eliminar un contacto */
  static async deleteContact(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Contacto con ID ${id} eliminado`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /** 🔹 Actualizar un contacto (Alineado con Contacts.ts) */
  static async updateContact(
    contactId: number,
    contactData: IContacto,
    token: string
  ): Promise<IContacto> {
    try {
      console.log("Enviando Solicitud de actualizacion de datos:", contactData);
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

export default Contacts;

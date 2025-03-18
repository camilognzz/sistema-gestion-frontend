import axios from "axios";
import { User } from "./Users";

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  responsable: User;
  fechaInicio: string;
  fechaFin: string;
  estado: "SIN_INICIAR" | "EN_PROGRESO" | "FINALIZADO" | "CANCELADO";
}


class Projects {
  private static readonly BASE_URL = "http://localhost:8080/api/v1/proyectos";

  /** 🔹 Obtener todos los proyectos */
  static async getAllProjects(token: string): Promise<Proyecto[]> {
    try {
      const response = await axios.get<Proyecto[]>(this.BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📡 Proyectos obtenidos:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /** 🔹 Obtener un proyecto por ID */
  static async getProjectById(id: number, token: string): Promise<Proyecto | null> {
    try {
      const response = await axios.get<Proyecto>(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  /** 🔹 Crear o actualizar un proyecto */
  static async createOrUpdateProject(proyecto: Proyecto, token: string): Promise<void> {
    try {
      await axios.post(this.BASE_URL, proyecto, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Proyecto guardado correctamente");
    } catch (error) {
      this.handleError(error);
    }
  }

  /** 🔹 Eliminar un proyecto por ID */
  static async deleteProject(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`🗑️ Proyecto con ID ${id} eliminado`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /** 🔴 Manejo de errores */
  private static handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      console.error("❌ Error en la petición:", error.response?.data || error.message);
    } else {
      console.error("❌ Error inesperado:", error);
    }
  }
}

export default Projects;

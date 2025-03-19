import axios from "axios";
import { IProyecto } from "../projectspage/interface/IProjects";

class Projects {
  private static readonly BASE_URL = "http://localhost:8080/api/v1/proyectos";

  /** 🔹 Obtener todos los proyectos */
  static async getAllProjects(token: string): Promise<IProyecto[]> {
    try {
      const response = await axios.get<IProyecto[]>(this.BASE_URL, {
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
  static async getProjectById(id: number, token: string): Promise<IProyecto | null> {
    try {
      const response = await axios.get<IProyecto>(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📡 Proyecto obtenido:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  /** 🔹 Crear o actualizar un proyecto */
  static async CreateOrUpdate(projectData: IProyecto, token: string): Promise<IProyecto> {
    try {
      const response = await axios.post<IProyecto>(
        `${Projects.BASE_URL}`,
        projectData,
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
      throw error; // Re-lanzamos el error para manejarlo en el componente
    }
  }

  /** 🔹 Eliminar un proyecto */
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

  /** 🔹 Función auxiliar para manejar errores */
  private static handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      console.error("❌ Error en la petición:", {
        status: error.response?.status,
        data: error.response?.data,
        message,
      });
      if (error.response?.status === 403) {
        throw new Error("No tienes permisos para realizar esta acción.");
      }
      throw new Error(message);
    } else {
      console.error("❌ Error inesperado:", error);
      throw new Error("Error inesperado");
    }
  }
}

export default Projects;
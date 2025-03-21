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

  /** 🔹 Crear un proyecto */
  static async createProject(projectData: IProyecto, token: string): Promise<IProyecto> {
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
      console.log("✅ Proyecto creado:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
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
      throw error;
    }
  }

  /** 🔹 Actualizar un proyecto (Alineado con Users.ts) */
  static async updateProject(
    projectId: number,
    projectData: IProyecto,
    token: string
  ): Promise<IProyecto> {
    try {
      console.log("🔍 Enviando solicitud de actualización con datos:", projectData);
      const response = await axios.put<IProyecto>(
        `${this.BASE_URL}/${projectId}`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Respuesta del servidor:", response.data);
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

export default Projects;
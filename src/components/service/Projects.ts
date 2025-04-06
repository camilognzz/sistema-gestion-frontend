import axios from "axios";
import { IProyecto } from "../projectspage/interface/IProjects";

class Projects {
  private static readonly BASE_URL = "http://localhost:8080/api/v1/proyectos";

  static async getAllProjects(token: string): Promise<IProyecto[]> {
    try {
      const response = await axios.get<IProyecto[]>(this.BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  static async getProjectById(
    id: number,
    token: string
  ): Promise<IProyecto | null> {
    try {
      const response = await axios.get<IProyecto>(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  static async createProject(
    projectData: IProyecto,
    token: string
  ): Promise<IProyecto> {
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
      throw error;
    }
  }

  static async deleteProject(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async updateProject(
    projectId: number,
    projectData: IProyecto,
    token: string
  ): Promise<IProyecto> {
    try {
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

export default Projects;

import axios from "axios";

interface LoginResponse {
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  error?: string;
}

interface UserRegisterData {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  password?: string;
}

class Users {
  private static readonly BASE_URL = "http://localhost:8080";

  /** 🔹 Función auxiliar para manejar errores */
  private static handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Error en Axios:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Error en la solicitud");
    }
    console.error("❌ Error desconocido:", error);
    throw new Error("Error desconocido");
  }

  /** 🔹 Login */
  static async login(email: string, password: string) {
    try {
      const response = await axios.post(`${Users.BASE_URL}/auth/login`, {
        email,
        password,
      });

      console.log("🔍 Respuesta del backend:", response.data);

      const { token, role } = response.data; // Extraer datos correctamente

      if (!token || !role) {
        throw new Error("❌ No se recibió token o rol válido");
      }

      // Guardar en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      console.log("✅ Token y rol guardados en localStorage");
      return { token, role };
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  }

  /** 🔹 Registro */
  static async register(
    userData: UserRegisterData,
    token: string
  ): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${Users.BASE_URL}/auth/register`,
        userData,
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
    }
  }

  /** 🔹 Obtener todos los usuarios */
  static async getAllUsers(token: string): Promise<User[]> {
    try {
      const response = await axios.get<{
        statusCode: number;
        message: string;
        usersList: User[];
      }>(`${Users.BASE_URL}/admin/get-all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📡 Respuesta del backend:", response.data); // Depuración

      return response.data.usersList; // Extraer solo la lista de usuarios
    } catch (error) {
      this.handleError(error);
    }
  }

  /** 🔹 Obtener perfil propio */
  static async getYourProfile(token: string): Promise<User> {
    try {
      const response = await axios.get<{ user: User }>(
        `${Users.BASE_URL}/adminuser/get-profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.user;
    } catch (error) {
      this.handleError(error);
    }
  }

  /** 🔹 Obtener usuario por ID */
  static async getUserById(
    userId: string,
    token: string
  ): Promise<{ user: User }> {
    try {
      const response = await axios.get<{ user: User }>(
        `${Users.BASE_URL}/admin/get-users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error; // Lanza el error para manejarlo en `fetchUserDataById`
    }
  }

  /** 🔹 Eliminar usuario */
  static async deleteUser(userId: number, token: string): Promise<User> {
    try {
      const response = await axios.delete<User>(
        `${Users.BASE_URL}/admin/delete/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /** 🔹 Actualizar usuario */
  static async updateUser(
    userId: number,
    userData: UserRegisterData,
    token: string
  ): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${Users.BASE_URL}/admin/update/${userId}`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /** 🔹 Cerrar sesión */
  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    console.log("🚪 Sesión cerrada");
  }

  /** 🔹 Verificar autenticación */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  /** 🔹 Verificar si el usuario es admin */
  static isAdmin(): boolean {
    const role = localStorage.getItem("role");
    console.log("🔍 Verificando role en isAdmin:", role);
    return role === "ADMIN";
  }

  /** 🔹 Verificar si el usuario es normal */
  static isUser(): boolean {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.role?.toUpperCase() === "USER";
    } catch (error) {
      console.error("Error al parsear user:", error);
      return false;
    }
  }

  /** 🔹 Acceso exclusivo para administradores */
  static adminOnly(): boolean {
    return this.isAuthenticated() && this.isAdmin();
  }
}

export default Users;

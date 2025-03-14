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

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

class Users {
    private static readonly BASE_URL = "http://localhost:8080";

    static async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axios.post<LoginResponse>(`${Users.BASE_URL}/auth/login`, {
                email,
                password,
            });

            console.log("Respuesta de la API:", response.data);

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error en la solicitud:", error.response?.data);
                throw new Error(error.response?.data?.message || "Error en la solicitud");
            } else {
                throw new Error("Error desconocido");
            }
        }
    }


    static async register(userData: UserRegisterData, token: string): Promise<LoginResponse> {
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
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error en la solicitud");
            } else {
                throw new Error("Error desconocido");
            }
        }
    }

    static async getAllUsers(token: string): Promise<User[]> {
        try {
            const response = await axios.get<User[]>(`${Users.BASE_URL}/admin/get-all-user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error en la solicitud");
            } else {
                throw new Error("Error desconocido");
            }
        }
    }

    static async getYourProfile(token: string): Promise<User> {
        try {
            const response = await axios.get<User>(`${Users.BASE_URL}/adminuser/get-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error en la solicitud");
            } else {
                throw new Error("Error desconocido");
            }
        }
    }

    static async getUserById(userId: string, token: string): Promise<User> {
        try {
            const response = await axios.get<User>(`${Users.BASE_URL}/admin/get-user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error en la solicitud");
            } else {
                throw new Error("Error desconocido");
            }
        }
    }

    static async deleteUser(userId: number, token: string): Promise<User> {
        try {
            const response = await axios.delete<User>(`${Users.BASE_URL}/admin/delete/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error en la solicitud");
            } else {
                throw new Error("Error desconocido");
            }
        }
    }

    static async updateUser(userId: number, userData: UserRegisterData, token: string): Promise<User> {
        try {
            const response = await axios.put<User>(`${Users.BASE_URL}/admin/update/${userId}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error en la solicitud");
            } else {
                throw new Error("Error desconocido");
            }
        }
    }


    /* AUTHENTICATION CHECKER */
    static logout(){
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    }

    static isAuthenticated(){
        const token = localStorage.getItem('token');
        return !!token;
    }

    static isAdmin(){
        const role = localStorage.getItem('role');
        return role == 'ADMIN';
    }

    static isUser(){
        const role = localStorage.getItem('role');
        return role == 'USER';
    }

    static adminOnly(){
        return this.isAuthenticated() && this.isAdmin();
    }
}

export default Users;

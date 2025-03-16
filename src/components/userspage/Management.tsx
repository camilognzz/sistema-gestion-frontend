import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Users from "../service/Users";
import { FaUserPlus, FaTrash, FaEdit } from "react-icons/fa";
import Navbar from "../common/Navbar";
import Sidebar, { SidebarItem } from "../common/Sidebar";
import { User, Briefcase, Mail, Users as UsersIcon, DollarSign } from "lucide-react";

// Definir la interfaz de usuario
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Management: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  const fetchProfileInfo = async () => {
    try {
      const token = localStorage.getItem("token") ?? "";

      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response: UserProfile = await Users.getYourProfile(token);
      console.log("Perfil obtenido:", response);

      setProfileInfo(response);
    } catch (error) {
      console.error("Error fetching profile information:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const usersResponse: User[] = await Users.getAllUsers(token);

      if (Array.isArray(usersResponse)) {
        setUsers(usersResponse);
      } else {
        console.error("Invalid response format:", usersResponse);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const deleteUser = async (userId: number): Promise<void> => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this user?"
      );
      if (!confirmDelete) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found.");
        return;
      }

      await Users.deleteUser(userId, token);
      fetchUsers();
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      alert("Error deleting user. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar en la parte izquierda */}
      <Sidebar>
        {profileInfo?.role === "ADMIN" && (
          <Link to={"/admin/user-management"}>
            <SidebarItem icon={<User size={20} />} text="Usuarios" />
          </Link>
        )}
        <SidebarItem icon={<Briefcase size={20} />} text="Proyectos" />
        <SidebarItem icon={<Mail size={20} />} text="Contactos" />
        <SidebarItem icon={<UsersIcon size={20} />} text="Voluntarios" />
        {profileInfo?.role === "ADMIN" && (
          <SidebarItem icon={<DollarSign size={20} />} text="Finanzas" />
        )}
      </Sidebar>

      <div className="flex flex-col flex-1">
        {/* Navbar en la parte superior */}
        <Navbar />

        {/* Contenido principal */}
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Users Management
            </h2>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <FaUserPlus className="text-lg" />
              Add User
            </Link>
          </div>

          <div className="overflow-hidden rounded-lg shadow">
            <table className="w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <td className="py-3 px-4">{user.id}</td>
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-lg ${
                            user.role === "ADMIN"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex justify-center gap-3">
                        <button
                          className="text-red-600 hover:text-red-800 transition-all"
                          onClick={() => deleteUser(user.id)}
                        >
                          <FaTrash className="text-lg" />
                        </button>
                        <Link
                          to={`/update-user/${user.id}`}
                          className="text-yellow-500 hover:text-yellow-700 transition-all"
                        >
                          <FaEdit className="text-lg" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;

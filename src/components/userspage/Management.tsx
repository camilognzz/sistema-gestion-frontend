import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Users from "../service/Users";
import { FaUserPlus, FaTrash, FaEdit, FaChevronLeft, FaChevronRight, FaSearch, FaFilePdf, FaFileExcel, FaEye } from "react-icons/fa";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Management: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const usersPerPage = 7;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setCurrentPage(1);
  }, [searchTerm, users]);

  const fetchUsers = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const usersResponse: User[] = await Users.getAllUsers(token);

      if (Array.isArray(usersResponse)) {
        setUsers(usersResponse);
        setFilteredUsers(usersResponse);
      } else {
        console.error("Invalid response format:", usersResponse);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
      setError("Error al obtener los usuarios. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: number): Promise<void> => {
    try {
      const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
      if (!confirmDelete) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró un token de autenticación.");
        return;
      }

      await Users.deleteUser(userId, token);
      fetchUsers();
    } catch (error) {
      console.error(`Error al eliminar el usuario ${userId}:`, error);
      alert("Error al eliminar el usuario. Por favor, intenta de nuevo.");
    }
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Gestión de Usuarios", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["ID", "Nombre", "Correo", "Rol"]],
      body: users.map((user) => [
        user.id,
        user.name,
        user.email,
        user.role === "ADMIN" ? "Administrador" : "Usuario"
      ]),
    });

    doc.save("reporte_usuarios.pdf");
  };

  const exportToExcel = () => {
    const filteredUsers = users.map(({ id, name, email, role }) => ({
      id,
      name,
      email,
      role: role === "ADMIN" ? "Administrador" : "Usuario",
    }));
    const ws = XLSX.utils.json_to_sheet(filteredUsers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "reporte_usuarios.xlsx");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <div className="flex-1 p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Gestión de Usuarios</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-500" />
            </div>
            <Link
              to="/add-user"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
            >
              <FaUserPlus className="text-lg" /> Agregar Usuario
            </Link>
          </div>

          <div className="flex justify-end space-x-4 mb-4">
            <button onClick={exportToPDF} title="Exportar a PDF" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md">
              <FaFilePdf className="text-lg" />
            </button>
            <button onClick={exportToExcel} title="Exportar a Excel" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md">
              <FaFileExcel className="text-lg" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
                      <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Nombre</th>
                        <th className="py-3 px-4 text-left">Correo</th>
                        <th className="py-3 px-4 text-left">Rol</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.length > 0 ? (
                        currentUsers.map((user) => (
                          <tr key={user.id} className="border-t text-gray-700 hover:bg-gray-100 transition-all even:bg-gray-50">
                            <td className="py-3 px-4">{user.id}</td>
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={user.role === "ADMIN" ? "text-green-600" : "text-blue-600"}>
                                {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                              </span>
                            </td>
                            <td className="py-3 px-4 flex justify-center gap-3">
                              <button onClick={() => openModal(user)} className="text-gray-600 hover:text-gray-800 transition-all">
                                <FaEye className="text-lg" />
                              </button>
                              <Link to={`/update-user/${user.id}`} className="text-blue-500 hover:text-blue-700 transition-all">
                                <FaEdit className="text-lg" />
                              </Link>
                              <button className="text-red-600 hover:text-red-800 transition-all" onClick={() => deleteUser(user.id)}>
                                <FaTrash className="text-lg" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-500">No se encontraron usuarios.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-gray-700">
                  Página {currentPage} de {Math.ceil(filteredUsers.length / usersPerPage)}
                </span>
                <div className="flex gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-all shadow-md
                    ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage >= Math.ceil(filteredUsers.length / usersPerPage)}
                  className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-all shadow-md
                    ${currentPage >= Math.ceil(filteredUsers.length / usersPerPage) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  <FaChevronRight />
                </button>
                </div>
              </div>
            </>
          )}

          {/* Modal */}
          {isModalOpen && selectedUser && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/75">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-xl font-semibold mb-4">Detalles del Usuario</h3>
                <p><strong>ID:</strong> {selectedUser.id}</p>
                <p><strong>Nombre:</strong> {selectedUser.name}</p>
                <p><strong>Correo:</strong> {selectedUser.email}</p>
                <p><strong>Rol:</strong> {selectedUser.role === "ADMIN" ? "Administrador" : "Usuario"}</p>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Management;
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
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// ConfirmationModal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText: string;
  cancelText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  cancelText,
}) => {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-gray-900/60" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {title}
                </DialogTitle>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  onClick={onClose}
                >
                  {cancelText}
                </button>
                <button
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  onClick={onConfirm}
                >
                  {confirmText}
                </button>
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

// SuccessModal
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title }) => {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-gray-900/60" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {title}
                </DialogTitle>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

const Management: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
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

  const deleteUser = (userId: number): void => {
    setUserIdToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userIdToDelete === null) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró un token de autenticación.");
        return;
      }
      await Users.deleteUser(userIdToDelete, token);
      fetchUsers();
      setIsDeleteModalOpen(false);
      setTimeout(() => setIsSuccessModalOpen(true), 300);
    } catch (error) {
      console.error(`Error al eliminar el usuario ${userIdToDelete}:`, error);
      alert("Error al eliminar el usuario. Por favor, intenta de nuevo.");
    } finally {
      setUserIdToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserIdToDelete(null);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
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
        user.role === "ADMIN" ? "Administrador" : "Usuario",
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
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <Link
                  to="/add-user"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <FaUserPlus /> Nuevo
                </Link>
                <button
                  onClick={exportToPDF}
                  title="Exportar a PDF"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <FaFilePdf />
                </button>
                <button
                  onClick={exportToExcel}
                  title="Exportar a Excel"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <FaFileExcel />
                </button>
              </div>
            </div>

            {/* Table Section */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Cargando usuarios...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600 font-medium">{error}</div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                      <tr>
                        <th className="py-3 px-6">ID</th>
                        <th className="py-3 px-6">Nombre</th>
                        <th className="py-3 px-6">Correo</th>
                        <th className="py-3 px-6">Rol</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {currentUsers.length > 0 ? (
                        currentUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-4 px-6">{user.id}</td>
                            <td className="py-4 px-6">{user.name}</td>
                            <td className="py-4 px-6">{user.email}</td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === "ADMIN" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                              </span>
                            </td>
                            <td className="py-4 px-6 flex justify-center gap-4">
                              <button
                                onClick={() => openModal(user)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                                title="Ver detalles"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                              <Link
                                to={`/update-user/${user.id}`}
                                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                title="Editar"
                              >
                                <FaEdit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-500 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                                title="Eliminar"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No se encontraron usuarios
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between text-gray-600">
                  <span className="text-sm">
                    Página {currentPage} de {Math.ceil(filteredUsers.length / usersPerPage)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      }`}
                    >
                      <FaChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage >= Math.ceil(filteredUsers.length / usersPerPage)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage >= Math.ceil(filteredUsers.length / usersPerPage)
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      }`}
                    >
                      <FaChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Details Modal */}
            {isModalOpen && selectedUser && (
              <Transition show={isModalOpen} as={React.Fragment}>
                <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
                  <Transition.Child
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <DialogBackdrop className="fixed inset-0 bg-gray-900/60" />
                  </Transition.Child>
                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <DialogPanel className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Usuario</h3>
                        <div className="space-y-3 text-gray-700">
                          <p><span className="font-medium">ID:</span> {selectedUser.id}</p>
                          <p><span className="font-medium">Nombre:</span> {selectedUser.name}</p>
                          <p><span className="font-medium">Correo:</span> {selectedUser.email}</p>
                          <p>
                            <span className="font-medium">Rol:</span>{" "}
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                selectedUser.role === "ADMIN" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {selectedUser.role === "ADMIN" ? "Administrador" : "Usuario"}
                            </span>
                          </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={closeModal}
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            Cerrar
                          </button>
                        </div>
                      </DialogPanel>
                    </Transition.Child>
                  </div>
                </Dialog>
              </Transition>
            )}

            {/* Confirmation and Success Modals */}
            <ConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={closeDeleteModal}
              onConfirm={confirmDelete}
              title="¿Estás seguro de eliminar este usuario?"
              confirmText="Eliminar"
              cancelText="Cancelar"
            />
            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Usuario eliminado con éxito"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Management;
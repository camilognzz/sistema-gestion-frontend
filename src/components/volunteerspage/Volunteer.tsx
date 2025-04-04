import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Volunteers from "../service/Volunteers";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaEye,
} from "react-icons/fa";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Dialog, DialogBackdrop, DialogPanel, Transition } from "@headlessui/react";
import SuccessModal from "../modals/SuccessModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { IVoluntario } from "./interface/IVoluntario";

const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const formatDisponibilidad = (disponibilidad: string): string => {
  return disponibilidad.replace("_", " ");
};

const Volunteer: React.FC = () => {
  const [volunteers, setVolunteers] = useState<IVoluntario[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<IVoluntario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [volunteersPerPage, setVolunteersPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<IVoluntario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [volunteerIdToDelete, setVolunteerIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    setFilteredVolunteers(
      volunteers
        .filter((volunteer) =>
          volunteer.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .reverse()
    );
    setCurrentPage(1);
  }, [searchTerm, volunteers]);

  const fetchVolunteers = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        setError("No se encontró un token de autenticación.");
        return;
      }
      const volunteersResponse: IVoluntario[] = await Volunteers.getAllVolunteers(token);
      if (Array.isArray(volunteersResponse)) {
        setVolunteers(volunteersResponse);
        setFilteredVolunteers([...volunteersResponse].reverse());
      } else {
        console.error("Invalid response format:", volunteersResponse);
        setVolunteers([]);
        setFilteredVolunteers([]);
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      setVolunteers([]);
      setFilteredVolunteers([]);
      setError("Error al obtener los voluntarios. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVolunteer = (volunteerId: number | undefined): void => {
    if (volunteerId === undefined) return;
    setVolunteerIdToDelete(volunteerId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (volunteerIdToDelete === null) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró un token de autenticación.");
        return;
      }
      await Volunteers.deleteVolunteer(volunteerIdToDelete, token);
      fetchVolunteers();
      setIsDeleteModalOpen(false);
      setTimeout(() => setIsSuccessModalOpen(true), 300);
    } catch (error) {
      console.error(`Error al eliminar el voluntario ${volunteerIdToDelete}:`, error);
      alert("Error al eliminar el voluntario. Por favor, intenta de nuevo.");
    } finally {
      setVolunteerIdToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setVolunteerIdToDelete(null);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const openModal = (volunteer: IVoluntario) => {
    setSelectedVolunteer(volunteer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVolunteer(null);
  };

  const handleVolunteersPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVolunteersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastVolunteer = currentPage * volunteersPerPage;
  const indexOfFirstVolunteer = indexOfLastVolunteer - volunteersPerPage;
  const currentVolunteers = filteredVolunteers.slice(indexOfFirstVolunteer, indexOfLastVolunteer);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredVolunteers.length / volunteersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" }); 
    doc.text("Reporte de Voluntarios", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "ID",
          "Documento Identidad",
          "Nombre",
          "Email",
          "Teléfono",
          "Dirección",
          "Fecha Nacimiento",
          "Género",
          "Profesión",
          "Disponibilidad",
          "Fecha Registro",
        ],
      ],
      body: volunteers.map((volunteer) => [
        volunteer.id?.toString() ?? "N/A",
        volunteer.documentoIdentidad,
        volunteer.nombre,
        volunteer.email ?? "N/A",
        volunteer.telefono,
        volunteer.direccion ?? "N/A",
        volunteer.fechaNacimiento ? formatDate(volunteer.fechaNacimiento) : "N/A",
        volunteer.genero ?? "N/A",
        volunteer.profesion ?? "N/A",
        formatDisponibilidad(volunteer.disponibilidad),
        formatDate(volunteer.fechaRegistro),
      ]),
      styles: { fontSize: 8, cellPadding: 2 }, 
      columnStyles: {
        0: { cellWidth: 15 }, 
        1: { cellWidth: 25 }, 
        2: { cellWidth: 30 }, 
        3: { cellWidth: 35 }, 
        4: { cellWidth: 20 }, 
        5: { cellWidth: 35 }, 
        6: { cellWidth: 25 }, 
        7: { cellWidth: 20 }, 
        8: { cellWidth: 25 }, 
        9: { cellWidth: 25 }, 
        10: { cellWidth: 25 }, 
      },
    });
    doc.save("reporte_voluntarios.pdf");
  };

  const exportToExcel = () => {
    const filteredVolunteersExcel = volunteers.map(
      ({
        id,
        documentoIdentidad,
        nombre,
        email,
        telefono,
        direccion,
        fechaNacimiento,
        genero,
        profesion,
        disponibilidad,
        fechaRegistro,
      }) => ({
        id: id !== undefined ? id.toString() : "N/A",
        documentoIdentidad,
        nombre,
        email: email ?? "N/A",
        telefono,
        direccion: direccion ?? "N/A",
        fechaNacimiento: fechaNacimiento ? formatDate(fechaNacimiento) : "N/A",
        genero: genero ?? "N/A",
        profesion: profesion ?? "N/A",
        disponibilidad: formatDisponibilidad(disponibilidad),
        fechaRegistro: formatDate(fechaRegistro),
      })
    );
    const ws = XLSX.utils.json_to_sheet(filteredVolunteersExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Voluntarios");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "reporte_voluntarios.xlsx");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Voluntarios</h2>
                <select
                  value={volunteersPerPage}
                  onChange={handleVolunteersPerPageChange}
                  className="p-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={15}>15 por página</option>
                </select>
              </div>
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
                  to="/crear-voluntario"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <FaPlus /> Nuevo
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
                <p className="mt-2 text-gray-600">Cargando...</p>
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
                        <th className="py-3 px-6">Documento Identidad</th>
                        <th className="py-3 px-6">Nombre</th>
                        <th className="py-3 px-6">Email</th>
                        <th className="py-3 px-6">Teléfono</th>
                        <th className="py-3 px-6">Dirección</th>
                        <th className="py-3 px-6">Fecha Nacimiento</th>
                        <th className="py-3 px-6">Género</th>
                        <th className="py-3 px-6">Profesión</th>
                        <th className="py-3 px-6">Disponibilidad</th>
                        <th className="py-3 px-6">Fecha Registro</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {currentVolunteers.length > 0 ? (
                        currentVolunteers.map((volunteer) => (
                          <tr
                            key={volunteer.id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-4 px-6">{volunteer.id}</td>
                            <td className="py-4 px-6">{volunteer.documentoIdentidad}</td>
                            <td className="py-4 px-6">{volunteer.nombre}</td>
                            <td className="py-4 px-6">{volunteer.email ?? "N/A"}</td>
                            <td className="py-4 px-6">{volunteer.telefono}</td>
                            <td className="py-4 px-6">{volunteer.direccion ?? "N/A"}</td>
                            <td className="py-4 px-6">
                              {volunteer.fechaNacimiento ? formatDate(volunteer.fechaNacimiento) : "N/A"}
                            </td>
                            <td className="py-4 px-6">{volunteer.genero ?? "N/A"}</td>
                            <td className="py-4 px-6">{volunteer.profesion ?? "N/A"}</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              {formatDisponibilidad(volunteer.disponibilidad)}
                            </td>
                            <td className="py-4 px-6">{formatDate(volunteer.fechaRegistro)}</td>
                            <td className="py-4 px-6 flex justify-center gap-4">
                              <button
                                onClick={() => openModal(volunteer)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                                title="Ver detalles"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                              <Link
                                to={`/actualizar-voluntario/${volunteer.id}`}
                                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                title="Editar"
                              >
                                <FaEdit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => deleteVolunteer(volunteer.id)}
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
                          <td colSpan={12} className="py-8 text-center text-gray-500">
                            No se encontraron voluntarios
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between text-gray-600">
                  <span className="text-sm">
                    Página {currentPage} de {Math.ceil(filteredVolunteers.length / volunteersPerPage)}
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
                      disabled={currentPage >= Math.ceil(filteredVolunteers.length / volunteersPerPage)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage >= Math.ceil(filteredVolunteers.length / volunteersPerPage)
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
            {isModalOpen && selectedVolunteer && (
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Detalles del Voluntario
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            <span className="font-medium">ID:</span> {selectedVolunteer.id}
                          </p>
                          <p>
                            <span className="font-medium">Documento Identidad:</span>{" "}
                            {selectedVolunteer.documentoIdentidad}
                          </p>
                          <p>
                            <span className="font-medium">Nombre:</span> {selectedVolunteer.nombre}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span> {selectedVolunteer.email ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Teléfono:</span> {selectedVolunteer.telefono}
                          </p>
                          <p>
                            <span className="font-medium">Dirección:</span>{" "}
                            {selectedVolunteer.direccion ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Fecha Nacimiento:</span>{" "}
                            {selectedVolunteer.fechaNacimiento
                              ? formatDate(selectedVolunteer.fechaNacimiento)
                              : "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Género:</span> {selectedVolunteer.genero ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Profesión:</span>{" "}
                            {selectedVolunteer.profesion ?? "N/A"}
                          </p>
                          <p className="whitespace-nowrap">
                            <span className="font-medium">Disponibilidad:</span>{" "}
                            {formatDisponibilidad(selectedVolunteer.disponibilidad)}
                          </p>
                          <p>
                            <span className="font-medium">Fecha Registro:</span>{" "}
                            {formatDate(selectedVolunteer.fechaRegistro)}
                          </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={closeModal}
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
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
              title="¿Estás seguro de eliminar este voluntario?"
              confirmText="Eliminar"
              cancelText="Cancelar"
            />

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Voluntario eliminado exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Volunteer;
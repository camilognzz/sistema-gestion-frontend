import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Projects from "../service/Projects";
import { FaPlus, FaTrash, FaEdit, FaChevronLeft, FaChevronRight, FaSearch, FaFilePdf, FaFileExcel, FaEye } from "react-icons/fa";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Dialog, DialogBackdrop, DialogPanel, Transition } from "@headlessui/react";
import SuccessModal from "../modals/SuccessModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { IProyecto } from "./interface/IProjects";

// Función para formatear la fecha de "YYYY-MM-DD" a "DD/MM/YYYY"
const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

// Función para formatear el estado, reemplazando guiones por espacios
const formatEstado = (estado: string): string => {
  return estado.replace(/_/g, " ");
};

const Project: React.FC = () => {
  const [projects, setProjects] = useState<IProyecto[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<IProyecto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<IProyecto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState<number | null>(null);
  const projectsPerPage = 7;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setFilteredProjects(
      projects.filter((project) =>
        project.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setCurrentPage(1);
  }, [searchTerm, projects]);

  const fetchProjects = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        setError("No se encontró un token de autenticación.");
        return;
      }
      const projectsResponse: IProyecto[] = await Projects.getAllProjects(token);
      if (Array.isArray(projectsResponse)) {
        setProjects(projectsResponse);
        setFilteredProjects(projectsResponse);
      } else {
        console.error("Invalid response format:", projectsResponse);
        setProjects([]);
        setFilteredProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
      setFilteredProjects([]);
      setError("Error al obtener los proyectos. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = (projectId: number | undefined): void => {
    if (projectId === undefined) return;
    setProjectIdToDelete(projectId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (projectIdToDelete === null) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró un token de autenticación.");
        return;
      }
      await Projects.deleteProject(projectIdToDelete, token);
      fetchProjects();
      setIsDeleteModalOpen(false);
      setTimeout(() => setIsSuccessModalOpen(true), 300);
    } catch (error) {
      console.error(`Error al eliminar el proyecto ${projectIdToDelete}:`, error);
      alert("Error al eliminar el proyecto. Por favor, intenta de nuevo.");
    } finally {
      setProjectIdToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProjectIdToDelete(null);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const openModal = (project: IProyecto) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredProjects.length / projectsPerPage)) {
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
    doc.text("Reporte de Gestión de Proyectos", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["ID", "Nombre", "Responsable", "Estado", "Fecha Inicio", "Fecha Fin"]],
      body: projects.map((project) => [
        project.id ?? "N/A",
        project.nombre,
        project.responsable.name,
        formatEstado(project.estado),
        formatDate(project.fechaInicio),
        formatDate(project.fechaFin),
      ]),
    });
    doc.save("reporte_proyectos.pdf");
  };

  const exportToExcel = () => {
    const filteredProjects = projects.map(({ id, nombre, responsable, estado, fechaInicio, fechaFin }) => ({
      id: id ?? "N/A",
      nombre,
      responsable: responsable.name,
      estado: formatEstado(estado),
      fechaInicio: formatDate(fechaInicio),
      fechaFin: formatDate(fechaFin),
    }));
    const ws = XLSX.utils.json_to_sheet(filteredProjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proyectos");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "reporte_proyectos.xlsx");
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
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Proyectos</h2>
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
                  to="/create-project"
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
                <p className="mt-2 text-gray-600">Cargando proyectos...</p>
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
                        <th className="py-3 px-6">Responsable</th>
                        <th className="py-3 px-6">Estado</th>
                        <th className="py-3 px-6">Fecha Inicio</th>
                        <th className="py-3 px-6">Fecha Fin</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {currentProjects.length > 0 ? (
                        currentProjects.map((project) => (
                          <tr
                            key={project.id ?? Math.random()}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-4 px-6">{project.id ?? "N/A"}</td>
                            <td className="py-4 px-6">{project.nombre}</td>
                            <td className="py-4 px-6">{project.responsable.name}</td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  project.estado === "FINALIZADO"
                                    ? "bg-green-100 text-green-800"
                                    : project.estado === "EN_PROGRESO"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : project.estado === "CANCELADO"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {formatEstado(project.estado)}
                              </span>
                            </td>
                            <td className="py-4 px-6">{formatDate(project.fechaInicio)}</td>
                            <td className="py-4 px-6">{formatDate(project.fechaFin)}</td>
                            <td className="py-4 px-6 flex justify-center gap-4">
                              <button
                                onClick={() => openModal(project)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                                title="Ver detalles"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                              <Link
                                to={`/update-project/${project.id ?? ""}`}
                                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                title="Editar"
                              >
                                <FaEdit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => deleteProject(project.id)}
                                className="text-red-500 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                                title="Eliminar"
                                disabled={project.id === undefined}
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            No se encontraron proyectos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between text-gray-600">
                  <span className="text-sm">
                    Página {currentPage} de {Math.ceil(filteredProjects.length / projectsPerPage)}
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
                      disabled={currentPage >= Math.ceil(filteredProjects.length / projectsPerPage)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage >= Math.ceil(filteredProjects.length / projectsPerPage)
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
            {isModalOpen && selectedProject && (
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Proyecto</h3>
                        <div className="space-y-3 text-gray-700">
                          <p><span className="font-medium">ID:</span> {selectedProject.id ?? "N/A"}</p>
                          <p><span className="font-medium">Nombre:</span> {selectedProject.nombre}</p>
                          <p><span className="font-medium">Descripción:</span> {selectedProject.descripcion}</p>
                          <p><span className="font-medium">Responsable:</span> {selectedProject.responsable.name}</p>
                          <p><span className="font-medium">Fecha Inicio:</span> {formatDate(selectedProject.fechaInicio)}</p>
                          <p><span className="font-medium">Fecha Fin:</span> {formatDate(selectedProject.fechaFin)}</p>
                          <p>
                            <span className="font-medium">Estado:</span>{" "}
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                selectedProject.estado === "FINALIZADO"
                                  ? "bg-green-100 text-green-800"
                                  : selectedProject.estado === "EN_PROGRESO"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : selectedProject.estado === "CANCELADO"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {formatEstado(selectedProject.estado)}
                            </span>
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
              title="¿Estás seguro de eliminar este proyecto?"
              confirmText="Eliminar"
              cancelText="Cancelar"
            />

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Proyecto eliminado exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Project;
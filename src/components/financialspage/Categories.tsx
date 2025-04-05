import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Categories from "../service/Categories";
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
  FaArrowLeft, // Nuevo ícono para el botón "Atrás"
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
import { ITransactionCategory } from "../financialspage/interface/ICategory";

const Category: React.FC = () => {
  const [categories, setCategories] = useState<ITransactionCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ITransactionCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState(5); // Valor inicial ajustable
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ITransactionCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredCategories(
      categories
        .filter((category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .reverse() // Ordenar del último al primero
    );
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const fetchCategories = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        setError("No se encontró un token de autenticación.");
        return;
      }
      const categoriesResponse = await Categories.getAllCategories(token);
      setCategories(categoriesResponse);
      setFilteredCategories([...categoriesResponse].reverse()); // Orden inverso inicial
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      setFilteredCategories([]);
      setError("Error al obtener las categorías. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = (categoryId: number | undefined): void => {
    if (categoryId === undefined) return;
    setCategoryIdToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryIdToDelete === null) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró un token de autenticación.");
        return;
      }
      await Categories.deleteCategory(categoryIdToDelete, token);
      fetchCategories();
      setIsDeleteModalOpen(false);
      setTimeout(() => setIsSuccessModalOpen(true), 300);
    } catch (error) {
      console.error(`Error al eliminar la categoría ${categoryIdToDelete}:`, error);
      alert("Error al eliminar la categoría. Por favor, intenta de nuevo.");
    } finally {
      setCategoryIdToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryIdToDelete(null);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const openModal = (category: ITransactionCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCategoriesPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredCategories.length / categoriesPerPage)) {
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
    doc.text("Reporte de Categorías", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["ID", "Nombre", "Descripción"]],
      body: categories.map((category) => [
        category.id?.toString() ?? "N/A",
        category.name,
        category.description ?? "N/A",
      ]),
    });
    doc.save("reporte_categorias.pdf");
  };

  const exportToExcel = () => {
    const filteredCategoriesExcel = categories.map(
      ({ id, name, description }) => ({
        id: id !== undefined ? id.toString() : "N/A",
        name,
        description: description ?? "N/A",
      })
    );
    const ws = XLSX.utils.json_to_sheet(filteredCategoriesExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categorías");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "reporte_categorias.xlsx");
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
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
                <select
                  value={categoriesPerPage}
                  onChange={handleCategoriesPerPageChange}
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
                  to="/finanzas"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm"
                >
                  <FaArrowLeft /> Atrás
                </Link>
                <Link
                  to="/crear-categoria"
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
                        <th className="py-3 px-6">Nombre</th>
                        <th className="py-3 px-6">Descripción</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {currentCategories.length > 0 ? (
                        currentCategories.map((category) => (
                          <tr
                            key={category.id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-4 px-6">{category.id}</td>
                            <td className="py-4 px-6">{category.name}</td>
                            <td className="py-4 px-6">{category.description ?? "N/A"}</td>
                            <td className="py-4 px-6 flex justify-center gap-4">
                              <button
                                onClick={() => openModal(category)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                                title="Ver detalles"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                              <Link
                                to={`/actualizar-categoria/${category.id}`}
                                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                title="Editar"
                              >
                                <FaEdit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => deleteCategory(category.id)}
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
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            No se encontraron categorías
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between text-gray-600">
                  <span className="text-sm">
                    Página {currentPage} de {Math.ceil(filteredCategories.length / categoriesPerPage)}
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
                      disabled={currentPage >= Math.ceil(filteredCategories.length / categoriesPerPage)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage >= Math.ceil(filteredCategories.length / categoriesPerPage)
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
            {isModalOpen && selectedCategory && (
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
                          Detalles de la Categoría
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            <span className="font-medium">ID:</span> {selectedCategory.id}
                          </p>
                          <p>
                            <span className="font-medium">Nombre:</span> {selectedCategory.name}
                          </p>
                          <p>
                            <span className="font-medium">Descripción:</span> {selectedCategory.description ?? "N/A"}
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
              title="¿Estás seguro de eliminar esta categoría?"
              confirmText="Eliminar"
              cancelText="Cancelar"
            />

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Categoría eliminada exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Category;
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Contacts from "../service/Contacts";
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
import { IContacto } from "../contactspage/interface/IContacto";

const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const Contact: React.FC = () => {
  const [contacts, setContacts] = useState<IContacto[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<IContacto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage, setContactsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<IContacto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [contactIdToDelete, setContactIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    setFilteredContacts(
      contacts
        .filter((contact) =>
          contact.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .reverse()
    );
    setCurrentPage(1);
  }, [searchTerm, contacts]);

  const fetchContacts = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        setError("No se encontró un token de autenticación.");
        return;
      }
      const contactsResponse: IContacto[] = await Contacts.getAllContacts(token);
      if (Array.isArray(contactsResponse)) {
        setContacts(contactsResponse);
        setFilteredContacts([...contactsResponse].reverse());
      } else {
        console.error("Invalid response format:", contactsResponse);
        setContacts([]);
        setFilteredContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setContacts([]);
      setFilteredContacts([]);
      setError("Error al obtener los contactos. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContact = (contactId: number | undefined): void => {
    if (contactId === undefined) return;
    setContactIdToDelete(contactId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (contactIdToDelete === null) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró un token de autenticación.");
        return;
      }
      await Contacts.deleteContact(contactIdToDelete, token);
      fetchContacts();
      setIsDeleteModalOpen(false);
      setTimeout(() => setIsSuccessModalOpen(true), 300);
    } catch (error) {
      console.error(`Error al eliminar el contacto ${contactIdToDelete}:`, error);
      alert("Error al eliminar el contacto. Por favor, intenta de nuevo.");
    } finally {
      setContactIdToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setContactIdToDelete(null);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const openModal = (contact: IContacto) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  const handleContactsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContactsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredContacts.length / contactsPerPage)) {
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
    doc.text("Reporte de Contactos Estratégicos", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["ID", "Nombre", "Tipo de Contacto", "Teléfono", "Email", "Dirección", "Cargo", "Notas", "Fecha de Registro"]],
      body: contacts.map((contact) => [
        contact.id?.toString() ?? "N/A",
        contact.nombre,
        contact.tipoContacto,
        contact.telefono,
        contact.email,
        contact.direccion ?? "N/A",
        contact.cargo ?? "N/A",
        contact.notas ?? "N/A",
        formatDate(contact.fechaRegistro),
      ]),
    });
    doc.save("reporte_contactos.pdf");
  };

  const exportToExcel = () => {
    const filteredContactsExcel = contacts.map(
      ({ id, nombre, tipoContacto, telefono, email, direccion, cargo, notas, fechaRegistro }) => ({
        id: id !== undefined ? id.toString() : "N/A",
        nombre,
        tipoContacto,
        telefono,
        email,
        direccion: direccion ?? "N/A",
        cargo: cargo ?? "N/A",
        notas: notas ?? "N/A",
        fechaRegistro: formatDate(fechaRegistro),
      })
    );
    const ws = XLSX.utils.json_to_sheet(filteredContactsExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contactos");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "reporte_contactos.xlsx");
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
                <h2 className="text-2xl font-bold text-gray-800">Contactos Estratégicos</h2>
                <select
                  value={contactsPerPage}
                  onChange={handleContactsPerPageChange}
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
                  to="/crear-contacto"
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
                        <th className="py-3 px-6">Tipo de Contacto</th>
                        <th className="py-3 px-6">Teléfono</th>
                        <th className="py-3 px-6">Email</th>
                        <th className="py-3 px-6">Dirección</th>
                        <th className="py-3 px-6">Cargo</th>
                        <th className="py-3 px-6">Notas</th>
                        <th className="py-3 px-6">Fecha de Registro</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {currentContacts.length > 0 ? (
                        currentContacts.map((contact) => (
                          <tr
                            key={contact.id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-4 px-6">{contact.id}</td>
                            <td className="py-4 px-6">{contact.nombre}</td>
                            <td className="py-4 px-6">{contact.tipoContacto}</td>
                            <td className="py-4 px-6">{contact.telefono}</td>
                            <td className="py-4 px-6">{contact.email}</td>
                            <td className="py-4 px-6">{contact.direccion ?? "N/A"}</td>
                            <td className="py-4 px-6">{contact.cargo ?? "N/A"}</td>
                            <td className="py-4 px-6">{contact.notas ?? "N/A"}</td>
                            <td className="py-4 px-6">{formatDate(contact.fechaRegistro)}</td>
                            <td className="py-4 px-6 flex justify-center gap-4">
                              <button
                                onClick={() => openModal(contact)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                                title="Ver detalles"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                              <Link
                                to={`/actualizar-contacto/${contact.id}`}
                                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                title="Editar"
                              >
                                <FaEdit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => deleteContact(contact.id)}
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
                          <td colSpan={10} className="py-8 text-center text-gray-500">
                            No se encontraron contactos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between text-gray-600">
                  <span className="text-sm">
                    Página {currentPage} de {Math.ceil(filteredContacts.length / contactsPerPage)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all duration-200 ${currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        }`}
                    >
                      <FaChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage >= Math.ceil(filteredContacts.length / contactsPerPage)}
                      className={`p-2 rounded-lg transition-all duration-200 ${currentPage >= Math.ceil(filteredContacts.length / contactsPerPage)
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
            {isModalOpen && selectedContact && (
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
                          Detalles del Contacto
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            <span className="font-medium">ID:</span> {selectedContact.id}
                          </p>
                          <p>
                            <span className="font-medium">Nombre:</span> {selectedContact.nombre}
                          </p>
                          <p>
                            <span className="font-medium">Tipo de Contacto:</span> {selectedContact.tipoContacto}
                          </p>
                          <p>
                            <span className="font-medium">Teléfono:</span> {selectedContact.telefono}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span> {selectedContact.email}
                          </p>
                          <p>
                            <span className="font-medium">Dirección:</span> {selectedContact.direccion ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Cargo:</span> {selectedContact.cargo ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Notas:</span> {selectedContact.notas ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Fecha de Registro:</span> {formatDate(selectedContact.fechaRegistro)}
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
              title="¿Estás seguro de eliminar este contacto?"
              confirmText="Eliminar"
              cancelText="Cancelar"
            />

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Contacto eliminado exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;
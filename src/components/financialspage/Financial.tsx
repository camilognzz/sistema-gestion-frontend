import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Financials from "../service/Financials"; // Ajusta la ruta según tu estructura
import {
  FaPlus,
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
import { IFinancialTransaction } from "../financialspage/interface/IFinancial"; // Ajusta la ruta según tu estructura

// Función para formatear la fecha de "YYYY-MM-DD" a "DD/MM/YYYY"
const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

// Función para formatear el monto con dos decimales y símbolo de moneda
const formatAmount = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

const Financial: React.FC = () => {
  const [transactions, setTransactions] = useState<IFinancialTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<IFinancialTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<IFinancialTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const transactionsPerPage = 7;

  // Rango de fechas por defecto: último mes
  const defaultEndDate = new Date().toISOString().split("T")[0];
  const defaultStartDate = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setFilteredTransactions(
      transactions.filter((transaction) =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setCurrentPage(1);
  }, [searchTerm, transactions]);

  const fetchTransactions = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        setError("No se encontró un token de autenticación.");
        return;
      }
      const transactionsResponse = await Financials.getTransactionsByDateRange(
        defaultStartDate,
        defaultEndDate,
        token
      );
      if (Array.isArray(transactionsResponse)) {
        setTransactions(transactionsResponse);
        setFilteredTransactions(transactionsResponse);
      } else {
        console.error("Invalid response format:", transactionsResponse);
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setFilteredTransactions([]);
      setError("Error al obtener las transacciones. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (transaction: IFinancialTransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredTransactions.length / transactionsPerPage)) {
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
    doc.text("Reporte de Transacciones Financieras", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [
        ["ID", "Descripción", "Monto", "Tipo", "Categoría", "Fecha"],
      ],
      body: transactions.map((transaction) => [
        transaction.id?.toString() ?? "N/A",
        transaction.description,
        formatAmount(transaction.amount),
        transaction.type,
        transaction.category?.name ?? "N/A",
        formatDate(transaction.transactionDate),
      ]),
      styles: { cellWidth: "wrap" },
    });
    doc.save("reporte_transacciones.pdf");
  };

  const exportToExcel = () => {
    const filteredTransactionsExcel = transactions.map(
      ({ id, description, amount, type, category, transactionDate }) => ({
        id: id !== undefined ? id.toString() : "N/A",
        description,
        amount: formatAmount(amount),
        type,
        category: category?.name ?? "N/A",
        transactionDate: formatDate(transactionDate),
      })
    );
    const ws = XLSX.utils.json_to_sheet(filteredTransactionsExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "reporte_transacciones.xlsx");
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
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Finanzas</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por descripción..."
                    className="w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <Link
                  to="/crear-transaccion"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <FaPlus /> Nueva Transacción
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
                <p className="mt-2 text-gray-600">Cargando transacciones...</p>
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
                        <th className="py-3 px-6">Descripción</th>
                        <th className="py-3 px-6">Monto</th>
                        <th className="py-3 px-6">Tipo</th>
                        <th className="py-3 px-6">Categoría</th>
                        <th className="py-3 px-6">Fecha</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {currentTransactions.length > 0 ? (
                        currentTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="py-4 px-6">{transaction.id}</td>
                            <td className="py-4 px-6">{transaction.description}</td>
                            <td className="py-4 px-6">{formatAmount(transaction.amount)}</td>
                            <td className="py-4 px-6">{transaction.type}</td>
                            <td className="py-4 px-6">{transaction.category?.name ?? "N/A"}</td>
                            <td className="py-4 px-6">{formatDate(transaction.transactionDate)}</td>
                            <td className="py-4 px-6 flex justify-center gap-4">
                              <button
                                onClick={() => openModal(transaction)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                                title="Ver detalles"
                              >
                                <FaEye className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            No se encontraron transacciones
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between text-gray-600">
                  <span className="text-sm">
                    Página {currentPage} de {Math.ceil(filteredTransactions.length / transactionsPerPage)}
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
                      disabled={currentPage >= Math.ceil(filteredTransactions.length / transactionsPerPage)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage >= Math.ceil(filteredTransactions.length / transactionsPerPage)
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
            {isModalOpen && selectedTransaction && (
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
                          Detalles de la Transacción
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            <span className="font-medium">ID:</span> {selectedTransaction.id}
                          </p>
                          <p>
                            <span className="font-medium">Descripción:</span> {selectedTransaction.description}
                          </p>
                          <p>
                            <span className="font-medium">Monto:</span> {formatAmount(selectedTransaction.amount)}
                          </p>
                          <p>
                            <span className="font-medium">Tipo:</span> {selectedTransaction.type}
                          </p>
                          <p>
                            <span className="font-medium">Categoría:</span>{" "}
                            {selectedTransaction.category?.name ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Fecha:</span>{" "}
                            {formatDate(selectedTransaction.transactionDate)}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Financial;
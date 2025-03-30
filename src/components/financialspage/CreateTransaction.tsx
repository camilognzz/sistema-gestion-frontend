// src/financialspage/CreateTransaction.tsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Financials from "../service/Financials"; // Ajusta la ruta según tu estructura
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { IFinancialTransactionDTO, TransactionType } from "../financialspage/interface/IFinancial"; // Ajusta la ruta según tu estructura
import axios from "axios";

// Tipos para los errores de validación
interface FormErrors {
  description?: string;
  amount?: string;
  type?: string;
  categoryId?: string;
  transactionDate?: string;
}

const CreateTransaction: React.FC = () => {
  const navigate = useNavigate();

  // Estado inicial del formulario alineado con IFinancialTransactionDTO
  const [formData, setFormData] = useState<IFinancialTransactionDTO>({
    description: "",
    amount: 0,
    type: TransactionType.INCOME,
    categoryId: 0, // Asumimos que 0 es un valor inválido; ajusta según tus categorías
    transactionDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Manejo de cambios en los inputs
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === "amount" ? parseFloat(value) || 0 : value,
      }));
      setErrors((prev) => ({ ...prev, [name]: undefined })); // Limpiar error al cambiar
    },
    []
  );

  // Validación del formulario
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria.";
    }
    if (formData.amount <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0.";
    }
    if (!formData.type) {
      newErrors.type = "El tipo de transacción es obligatorio.";
    }
    if (formData.categoryId <= 0) {
      newErrors.categoryId = "Selecciona una categoría válida.";
    }
    if (!formData.transactionDate) {
      newErrors.transactionDate = "La fecha de la transacción es obligatoria.";
    }
    return newErrors;
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({ description: "No se encontró un token de autenticación." });
        setIsLoading(false);
        return;
      }

      console.log("Datos enviados al backend:", JSON.stringify(formData, null, 2));
      const response = await Financials.createTransaction(formData, token);
      console.log("Respuesta del backend:", JSON.stringify(response, null, 2));

      setIsSuccessModalOpen(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Error desconocido al crear la transacción.";
        setErrors({ description: message });
        console.error("Error del backend:", err.response?.data);
      } else {
        setErrors({ description: "Error inesperado al crear la transacción." });
        console.error("Error inesperado:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de cancelación
  const handleCancel = useCallback(() => {
    navigate("/finanzas"); // Ajusta la ruta según tu estructura
  }, [navigate]);

  // Cerrar modal de éxito
  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
    navigate("/finanzas"); // Ajusta la ruta según tu estructura
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nueva Transacción</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese la descripción de la transacción"
                  disabled={isLoading}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Monto
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el monto de la transacción"
                  disabled={isLoading}
                />
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 cursor-pointer ${
                    errors.type ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                >
                  <option value={TransactionType.INCOME}>Ingreso</option>
                  <option value={TransactionType.EXPENSE}>Gasto</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 cursor-pointer ${
                    errors.categoryId ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                >
                  <option value={0}>Seleccione una categoría</option>
                  {/* Aquí deberías cargar las categorías dinámicamente desde el backend */}
                  <option value={1}>Salarios</option>
                  <option value={2}>Donaciones</option>
                  <option value={3}>Gastos Operativos</option>
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>

              <div>
                <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">
                  Fecha de Transacción
                </label>
                <input
                  type="date"
                  id="transactionDate"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.transactionDate ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                {errors.transactionDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.transactionDate}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Transacción guardada exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateTransaction;
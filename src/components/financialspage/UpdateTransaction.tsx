import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Financials from "../service/Financials"; // Ajusta la ruta según tu estructura
import Categories from "../service/Categories"; // Ajusta la ruta según tu estructura
import { ITransactionCategory } from "./interface/ICategory";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { IFinancialTransactionDTO } from "../financialspage/interface/IFinancial"; // Ajusta la ruta según tu estructura

const UpdateTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();

  const [formData, setFormData] = useState<IFinancialTransactionDTO>({
    description: "",
    amount: 0,
    type: "INCOME",
    categoryId: 0,
    transactionDate: "",
  });
  const [categories, setCategories] = useState<ITransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDataById(transactionId);
    }
    fetchCategories();
  }, [transactionId]);

  const fetchTransactionDataById = async (transactionId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found.");
        setError("No se encontró un token de autenticación.");
        setLoading(false);
        return;
      }

      const response = await Financials.getTransactionById(Number(transactionId), token);
      console.log("✅ API Response:", response);

      if (response) {
        setFormData({
          description: response.description,
          amount: response.amount,
          type: response.type,
          categoryId: response.category?.id || 0,
          transactionDate: response.transactionDate,
        });
        setLoading(false);
      } else {
        console.error("❌ No se encontró la transacción en la respuesta.");
        setError("No se encontró la transacción.");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error fetching transaction data:", error);
      setError("Error al cargar los datos de la transacción.");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró un token de autenticación.");
        return;
      }
      const categoriesResponse = await Categories.getAllCategories(token);
      setCategories(categoriesResponse);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("Error al cargar las categorías. Por favor, intenta de nuevo.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : name === "categoryId" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró un token de autenticación.");
        navigate("/login");
        return;
      }

      if (!transactionId) {
        console.error("❌ transactionId is undefined");
        setError("ID de la transacción no definido.");
        return;
      }

      // Validaciones básicas
      if (!formData.description.trim()) {
        setError("La descripción es obligatoria.");
        return;
      }
      if (formData.amount <= 0) {
        setError("El monto debe ser mayor que 0.");
        return;
      }
      if (formData.categoryId <= 0 || !categories.some((cat) => cat.id === formData.categoryId)) {
        setError("Por favor, selecciona una categoría válida.");
        return;
      }
      if (!formData.transactionDate) {
        setError("La fecha de la transacción es obligatoria.");
        return;
      }

      setUpdating(true);
      const updatedTransaction: IFinancialTransactionDTO = {
        description: formData.description,
        amount: formData.amount,
        type: formData.type as "INCOME" | "EXPENSE",
        categoryId: formData.categoryId,
        transactionDate: formData.transactionDate,
      };

      console.log("🔍 Enviando actualización:", updatedTransaction);
      await Financials.updateTransaction(Number(transactionId), updatedTransaction, token);
      console.log("✅ Transaction updated");
      setUpdating(false);
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setIsSuccessModalOpen(false);
        navigate("/finanzas");
      }, 2000);
    } catch (error) {
      console.error("❌ Error updating transaction:", error);
      setError("Error al actualizar la transacción.");
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate("/finanzas");
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/finanzas");
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex flex-1">
          <SidebarItems />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Cargando datos...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Actualizar Transacción
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount === 0 ? "" : formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Tipo
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  required
                >
                  <option value="INCOME">Ingreso</option>
                  <option value="EXPENSE">Gasto</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Categoría
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  required
                  disabled={categories.length === 0}
                >
                  {categories.length === 0 ? (
                    <option value="0">No hay categorías disponibles</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {categories.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    No se encontraron categorías. Crea una en "Agregar Categoría".
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Fecha de la Transacción
                </label>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar"
                  )}
                </button>
              </div>
            </form>

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Transacción Actualizada con Éxito"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpdateTransaction;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Financials from "../service/Financials";
import Categories from "../service/Categories";
import { ITransactionCategory } from "./interface/ICategory";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { IFinancialTransactionDTO } from "../financialspage/interface/IFinancial";

// Función para formatear el monto en pesos colombianos (COP)
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para parsear un valor en formato COP a número
const parseCOPAmount = (value: string): number => {
  const cleanedValue = value.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleanedValue) || 0;
};

const CreateTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IFinancialTransactionDTO>({
    description: "",
    amount: 0,
    type: "INCOME",
    categoryId: 0,
    transactionDate: new Date().toISOString().split("T")[0],
  });
  const [displayAmount, setDisplayAmount] = useState(""); // Estado para el monto mostrado
  const [categories, setCategories] = useState<ITransactionCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true); // Nuevo estado para carga de categorías
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró un token de autenticación.");
        return;
      }
      const categoriesResponse = await Categories.getAllCategories(token);
      setCategories(categoriesResponse);
      if (categoriesResponse.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: categoriesResponse[0].id ?? 0 }));
      }
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("Error al cargar las categorías. Por favor, intenta de nuevo.");
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "amount") {
      const cleanedValue = value.replace(/[^\d]/g, ""); // Permitir solo números
      const parsedAmount = parseCOPAmount(cleanedValue);
      setFormData((prev) => ({ ...prev, amount: parsedAmount }));
      setDisplayAmount(formatAmount(parsedAmount));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "categoryId" ? parseInt(value) : value,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.name === "amount") {
      setDisplayAmount(formatAmount(formData.amount));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.name === "amount") {
      setDisplayAmount(formData.amount.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró un token de autenticación.");
        setIsLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        setError("La descripción es obligatoria.");
        setIsLoading(false);
        return;
      }
      if (formData.amount <= 0) {
        setError("El monto debe ser mayor que 0.");
        setIsLoading(false);
        return;
      }
      if (formData.categoryId <= 0 || !categories.some((cat) => cat.id === formData.categoryId)) {
        setError("Por favor, selecciona una categoría válida.");
        setIsLoading(false);
        return;
      }
      if (!formData.transactionDate) {
        setError("La fecha de la transacción es obligatoria.");
        setIsLoading(false);
        return;
      }

      const transactionData: IFinancialTransactionDTO = {
        description: formData.description,
        amount: formData.amount,
        type: formData.type as "INCOME" | "EXPENSE",
        categoryId: formData.categoryId,
        transactionDate: formData.transactionDate,
      };

      console.log("Datos enviados al backend:", JSON.stringify(transactionData, null, 2));
      const response = await Financials.createTransaction(transactionData, token);
      console.log("Respuesta del backend:", JSON.stringify(response, null, 2));
      setIsLoading(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Error al crear transacción:", err);
      setError("Error al crear la transacción. Por favor, intenta de nuevo.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/finanzas");
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/finanzas");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nueva Transacción</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

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
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese la descripción de la transacción"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Monto
                </label>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={displayAmount || (formData.amount === 0 ? "" : formatAmount(formData.amount))}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="$0,00"
                />
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
                  className="mt-1 w-full px-4 py-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                >
                  <option value="INCOME">Ingreso</option>
                  <option value="EXPENSE">Gasto</option>
                </select>
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
                  className="mt-1 w-full px-4 py-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  disabled={isCategoriesLoading || categories.length === 0}
                >
                  {isCategoriesLoading ? (
                    <option value="0">Cargando categorías...</option>
                  ) : categories.length === 0 ? (
                    <option value="0">No hay categorías disponibles</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {!isCategoriesLoading && categories.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    No se encontraron categorías. Crea una en "Agregar Categoría".
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">
                  Fecha de la Transacción
                </label>
                <input
                  type="date"
                  id="transactionDate"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>Guardar</>
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
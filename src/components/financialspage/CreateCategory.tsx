import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Categories from "../service/Categories"; // Ajusta la ruta según tu estructura
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { ICategoryDTO } from "./interface/ICategory";

const CreateCategory: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ICategoryDTO>({
    name: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      // Validaciones básicas
      if (!formData.name.trim()) {
        setError("El nombre es obligatorio.");
        setIsLoading(false);
        return;
      }

      // Preparar datos para enviar
      const categoryData: ICategoryDTO = {
        name: formData.name,
        description: formData.description || undefined,
      };

      console.log("Datos enviados al backend:", JSON.stringify(categoryData, null, 2));
      const response = await Categories.createCategory(categoryData, token);
      console.log("Respuesta del backend:", JSON.stringify(response, null, 2));
      setIsLoading(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Error al crear categoría:", err);
      setError("Error desconocido al crear la categoría.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/categorias");
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/categorias");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nueva Categoría</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese el nombre de la categoría"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción (Opcional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description ?? ""} 
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese una descripción para la categoría"
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
              title="Categoría guardada exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateCategory;
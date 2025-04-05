import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Categories from "../service/Categories"; 
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { ICategoryDTO } from "../financialspage/interface/ICategory";
import axios from "axios";


interface FormErrors {
  name?: string;
  description?: string;
}

const UpdateCategory: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();

  
  const [formData, setFormData] = useState<ICategoryDTO>({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true); 
  const [isUpdating, setIsUpdating] = useState(false); 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  
  useEffect(() => {
    if (categoryId) {
      fetchCategoryDataById(categoryId);
    }
  }, [categoryId]);

  const fetchCategoryDataById = async (categoryId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({ name: "No se encontró un token de autenticación." });
        setIsLoading(false);
        return;
      }

      const response = await Categories.getCategoryById(Number(categoryId), token);
      if (response) {
        setFormData({
          name: response.name,
          description: response.description ?? "",
        });
      } else {
        setErrors({ name: "No se encontró la categoría." });
      }
    } catch (error) {
      console.error("❌ Error fetching category data:", error);
      setErrors({ name: "Error al cargar los datos de la categoría." });
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined })); 
    },
    []
  );

  
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }
    return newErrors;
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsUpdating(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({ name: "No se encontró un token de autenticación." });
        setIsUpdating(false);
        return;
      }

      if (!categoryId) {
        setErrors({ name: "ID de la categoría no definido." });
        setIsUpdating(false);
        return;
      }

      
      const categoryData: ICategoryDTO = {
        name: formData.name,
        description: formData.description!.trim() === "" ? undefined : formData.description,
      };

      console.log("Datos enviados al backend:", JSON.stringify(categoryData, null, 2));
      const response = await Categories.updateCategory(Number(categoryId), categoryData, token);
      console.log("Respuesta del backend:", JSON.stringify(response, null, 2));

      setIsSuccessModalOpen(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Error desconocido al actualizar la categoría.";
        setErrors({ name: message });
        console.error("Error del backend:", err.response?.data);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } else {
        setErrors({ name: "Error inesperado al actualizar la categoría." });
        console.error("Error inesperado:", err);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  
  const handleCancel = useCallback(() => {
    navigate("/categorias");
  }, [navigate]);

  
  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
    navigate("/categorias");
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex flex-1">
          <SidebarItems />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Cargando...</p>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Actualizar Categoría</h2>

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
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el nombre de la categoría"
                  disabled={isUpdating}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                  disabled={isUpdating}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Actualizar"
                  )}
                </button>
              </div>
            </form>

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Categoría actualizada exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpdateCategory;
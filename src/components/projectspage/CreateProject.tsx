import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Projects from "../service/Projects"; // Adjust the import path as needed
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import { FaSave, FaArrowLeft } from "react-icons/fa";

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  responsable: { id: number; name: string; email: string; role: string };
  fechaInicio: string;
  fechaFin: string;
  estado: "SIN_INICIAR" | "EN_PROGRESO" | "FINALIZADO" | "CANCELADO";
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    responsableId: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "SIN_INICIAR" as Proyecto["estado"],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded list of users for the responsable dropdown (replace with API call if needed)
  const users = [
    { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "USER" },
    { id: 2, name: "María López", email: "maria@example.com", role: "ADMIN" },
    // Add more users or fetch from an API
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

      const selectedUser = users.find((user) => user.id === parseInt(formData.responsableId));
      if (!selectedUser) {
        setError("Por favor, selecciona un responsable válido.");
        setIsLoading(false);
        return;
      }

      const project: Proyecto = {
        id: 0, // ID will be assigned by the backend
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        responsable: selectedUser,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        estado: formData.estado,
      };

      await Projects.createOrUpdateProject(project, token);
      navigate("/projects"); // Redirect to the project management page
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Error al crear el proyecto. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/projects"); // Redirect back to the project management page
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Proyecto</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese el nombre del proyecto"
                />
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese una descripción del proyecto"
                />
              </div>

              {/* Responsable */}
              <div>
                <label htmlFor="responsableId" className="block text-sm font-medium text-gray-700">
                  Responsable
                </label>
                <select
                  id="responsableId"
                  name="responsableId"
                  value={formData.responsableId}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                >
                  <option value="">Seleccione un responsable</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Inicio */}
              <div>
                <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  id="fechaFin"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                />
              </div>

              {/* Estado */}
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                >
                  <option value="SIN_INICIAR">Sin Iniciar</option>
                  <option value="EN_PROGRESO">En Progreso</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                  disabled={isLoading}
                >
                  <FaArrowLeft /> Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaSave /> Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateProject;
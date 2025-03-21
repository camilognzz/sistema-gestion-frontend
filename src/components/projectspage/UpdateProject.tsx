import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Projects from "../service/Projects";
import Users, { User } from "../service/Users";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { IProyecto } from "./interface/IProjects"; // Ajusta la ruta según tu estructura

// Función auxiliar para formatear fechas al formato YYYY-MM-DD
const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const UpdateProject: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [projectData, setProjectData] = useState<IProyecto>({
    nombre: "",
    descripcion: "",
    responsable: { id: 0 },
    fechaInicio: "",
    fechaFin: "",
    estado: "SIN_INICIAR",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectDataById(projectId);
      fetchUsers();
    }
  }, [projectId]);

  const fetchProjectDataById = async (projectId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found.");
        setError("No se encontró un token de autenticación.");
        return;
      }

      const response = await Projects.getProjectById(Number(projectId), token);
      console.log("✅ API Response:", response);

      if (response) {
        setProjectData({
          nombre: response.nombre,
          descripcion: response.descripcion,
          responsable: response.responsable,
          fechaInicio: formatDateForInput(response.fechaInicio),
          fechaFin: formatDateForInput(response.fechaFin),
          estado: response.estado,
        });
        setLoading(false);
      } else {
        console.error("❌ No se encontró el proyecto en la respuesta.");
        setError("No se encontró el proyecto.");
      }
    } catch (error) {
      console.error("❌ Error fetching project data:", error);
      setError("Error al cargar los datos del proyecto.");
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found.");
        setError("No se encontró un token de autenticación.");
        return;
      }
      const userList = await Users.getAllUsers(token);
      setUsers(userList);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setError("Error al obtener la lista de usuarios.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "responsableId") {
      const selectedUser = users.find((user) => user.id === Number(value));
      setProjectData((prev) => ({
        ...prev,
        responsable: selectedUser ? { id: selectedUser.id } : prev.responsable,
      }));
    } else {
      setProjectData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Token enviado:", token);
      if (!token) {
        setError("No se encontró un token de autenticación.");
        return;
      }

      if (!projectId) {
        console.error("❌ projectId is undefined");
        setError("ID del proyecto no definido.");
        return;
      }

      const startDate = new Date(projectData.fechaInicio);
      const endDate = new Date(projectData.fechaFin);
      if (endDate <= startDate) {
        setError("La fecha de fin debe ser mayor que la fecha de inicio.");
        return;
      }

      setUpdating(true);
      const updatedProject: IProyecto = {
        nombre: projectData.nombre,
        descripcion: projectData.descripcion,
        responsable: { id: projectData.responsable.id }, // Solo el ID
        fechaInicio: projectData.fechaInicio,
        fechaFin: projectData.fechaFin,
        estado: projectData.estado,
      };

      console.log("🔍 Enviando actualización:", updatedProject);
      await Projects.updateProject(Number(projectId), updatedProject, token);
      console.log("✅ Project updated");
      setUpdating(false);
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setIsSuccessModalOpen(false);
        navigate("/api/v1/proyectos");
      }, 2000);
    } catch (error: unknown) { // Cambiamos 'any' por 'unknown'
      console.error("❌ Error updating project:", error);
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate("/api/v1/proyectos");
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/api/v1/proyectos");
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
              Actualizar Proyecto
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={projectData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={projectData.descripcion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Responsable
                </label>
                <select
                  name="responsableId"
                  value={projectData.responsable.id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  required
                >
                  <option value="">Seleccione un responsable</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={projectData.fechaInicio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  name="fechaFin"
                  value={projectData.fechaFin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={projectData.estado}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  required
                >
                  <option value="SIN_INICIAR">Sin Iniciar</option>
                  <option value="EN_PROGRESO">En Progreso</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
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
          </div>

          <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={closeSuccessModal}
            title="Proyecto Actualizado con Éxito"
          />
        </main>
      </div>
    </div>
  );
};

export default UpdateProject;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Projects from "../service/Projects";
import Users, { User } from "../service/Users";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { IProyecto } from "./interface/IProjects";

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    responsableId: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "SIN_INICIAR" as IProyecto["estado"],
  });
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró un token de autenticación.");
          return;
        }
        const userList = await Users.getAllUsers(token);
        setUsers(userList);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
        setError("Error al obtener la lista de usuarios.");
        setUsers([]);
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

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

      const startDate = new Date(formData.fechaInicio);
      const endDate = new Date(formData.fechaFin);

      if (endDate <= startDate) {
        setError("La fecha de fin debe ser mayor que la fecha de inicio.");
        setIsLoading(false);
        return;
      }

      const project: IProyecto = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        responsable: { id: selectedUser.id, name: selectedUser.name, email: selectedUser.email, role: selectedUser.role },
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        estado: formData.estado,
      };

      const response = await Projects.createProject(project, token);
      console.log("Respuesta del backend:", JSON.stringify(response, null, 2));
      setIsLoading(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Error al crear proyecto:", err);
      setError("Error desconocido al crear el proyecto.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/proyectos");
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/proyectos");
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
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

            {isFetchingUsers ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Cargando usuarios...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="mt-1 w-full px-4 py-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                    disabled={users.length === 0}
                  >
                    <option value="">Seleccione un responsable</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="mt-1 w-full px-4 py-2 border  border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  />
                </div>

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
                    className="mt-1 w-full px-4 py-2  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  />
                </div>

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
                    className="mt-1 w-full px-4 py-2  cursor-pointer border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  >
                    <option value="SIN_INICIAR">Sin Iniciar</option>
                    <option value="EN_PROGRESO">En Progreso</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
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
                    disabled={isLoading || users.length === 0}
                  >
                    {isLoading ? (
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={closeSuccessModal}
              title="Proyecto guardado exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateProject;
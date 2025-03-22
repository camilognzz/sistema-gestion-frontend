import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Volunteers from "../service/Volunteers"; // Ajusta la ruta según tu estructura
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { IVoluntario } from "../volunteerspage/interface/IVoluntario"; // Ajusta la ruta según tu estructura
import axios from "axios";

// Tipos para los errores de validación
interface FormErrors {
  documentoIdentidad?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  disponibilidad?: string;
  fechaRegistro?: string;
}

const UpdateVolunteer: React.FC = () => {
  const navigate = useNavigate();
  const { volunteerId } = useParams<{ volunteerId: string }>();

  // Estado inicial del formulario alineado con IVoluntario
  const [formData, setFormData] = useState<IVoluntario>({
    id: undefined,
    documentoIdentidad: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
    genero: null,
    profesion: "",
    disponibilidad: "TIEMPO_COMPLETO",
    fechaRegistro: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true); // Para la carga inicial
  const [isUpdating, setIsUpdating] = useState(false); // Para el estado de actualización
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Cargar datos del voluntario al montar el componente
  useEffect(() => {
    if (volunteerId) {
      fetchVolunteerDataById(volunteerId);
    }
  }, [volunteerId]);

  const fetchVolunteerDataById = async (volunteerId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({ documentoIdentidad: "No se encontró un token de autenticación." });
        setIsLoading(false);
        return;
      }

      const response = await Volunteers.getVolunteerById(Number(volunteerId), token);
      if (response) {
        setFormData({
          id: response.id,
          documentoIdentidad: response.documentoIdentidad,
          nombre: response.nombre,
          email: response.email ?? "",
          telefono: response.telefono,
          direccion: response.direccion ?? "",
          fechaNacimiento: response.fechaNacimiento ?? "",
          genero: response.genero ?? null,
          profesion: response.profesion ?? "",
          disponibilidad: response.disponibilidad,
          fechaRegistro: response.fechaRegistro,
        });
      } else {
        setErrors({ documentoIdentidad: "No se encontró el voluntario." });
      }
    } catch (error) {
      console.error("❌ Error fetching volunteer data:", error);
      setErrors({ documentoIdentidad: "Error al cargar los datos del voluntario." });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de cambios en los inputs con useCallback para optimizar rendimiento
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined })); // Limpiar error al cambiar
    },
    []
  );

  // Validación del formulario
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.documentoIdentidad.trim()) {
      newErrors.documentoIdentidad = "El documento de identidad es obligatorio.";
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Por favor, ingresa un email válido.";
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio.";
    }
    if (!formData.disponibilidad) {
      newErrors.disponibilidad = "La disponibilidad es obligatoria.";
    }
    if (!formData.fechaRegistro) {
      newErrors.fechaRegistro = "La fecha de registro es obligatoria.";
    }
    return newErrors;
  };

  // Manejo del envío del formulario
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
        setErrors({ documentoIdentidad: "No se encontró un token de autenticación." });
        setIsUpdating(false);
        return;
      }

      if (!volunteerId || !formData.id) {
        setErrors({ documentoIdentidad: "ID del voluntario no definido." });
        setIsUpdating(false);
        return;
      }

      // Preparar datos para enviar (campos vacíos como null para el backend)
      const volunteerData: IVoluntario = {
        id: formData.id,
        documentoIdentidad: formData.documentoIdentidad,
        nombre: formData.nombre,
        email: formData.email!.trim() === "" ? null : formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion!.trim() === "" ? null : formData.direccion,
        fechaNacimiento: formData.fechaNacimiento!.trim() === "" ? null : formData.fechaNacimiento,
        genero: formData.genero || null,
        profesion: formData.profesion!.trim() === "" ? null : formData.profesion,
        disponibilidad: formData.disponibilidad,
        fechaRegistro: formData.fechaRegistro,
      };

      console.log("Datos enviados al backend:", JSON.stringify(volunteerData, null, 2));
      const response = await Volunteers.updateVolunteer(Number(volunteerId), volunteerData, token);
      console.log("Respuesta del backend:", JSON.stringify(response, null, 2));

      setIsSuccessModalOpen(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Error desconocido al actualizar el voluntario.";
        setErrors({ documentoIdentidad: message });
        console.error("Error del backend:", err.response?.data);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } else {
        setErrors({ documentoIdentidad: "Error inesperado al actualizar el voluntario." });
        console.error("Error inesperado:", err);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejo de cancelación
  const handleCancel = useCallback(() => {
    navigate("/voluntarios");
  }, [navigate]);

  // Cerrar modal de éxito
  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
    navigate("/voluntarios");
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Actualizar Voluntario</h2>


            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="documentoIdentidad" className="block text-sm font-medium text-gray-700">
                  Documento de Identidad 
                </label>
                <input
                  type="number"
                  id="documentoIdentidad"
                  name="documentoIdentidad"
                  value={formData.documentoIdentidad}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.documentoIdentidad ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el documento de identidad"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre 
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el nombre del voluntario"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email 
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email ?? ""}
                  onChange={handleChange}
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el email del voluntario"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Teléfono 
                </label>
                <input
                  type="number"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.telefono ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el teléfono del voluntario"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion ?? ""}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese la dirección del voluntario"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento (Opcional)
                </label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento ?? ""}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                  Género (Opcional)
                </label>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero ?? ""}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 cursor-pointer"
                  disabled={isUpdating}
                >
                  <option value="">Seleccione un género</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="profesion" className="block text-sm font-medium text-gray-700">
                  Profesión (Opcional)
                </label>
                <input
                  type="text"
                  id="profesion"
                  name="profesion"
                  value={formData.profesion ?? ""}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese la profesión del voluntario"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="disponibilidad" className="block text-sm font-medium text-gray-700">
                  Disponibilidad 
                </label>
                <select
                  id="disponibilidad"
                  name="disponibilidad"
                  value={formData.disponibilidad}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 cursor-pointer ${
                    errors.disponibilidad ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isUpdating}
                >
                  <option value="TIEMPO_COMPLETO">Tiempo Completo</option>
                  <option value="MEDIO_TIEMPO">Medio Tiempo</option>
                  <option value="OCASIONAL">Ocasional</option>
                </select>
              </div>

              <div>
                <label htmlFor="fechaRegistro" className="block text-sm font-medium text-gray-700">
                  Fecha de Registro 
                </label>
                <input
                  type="date"
                  id="fechaRegistro"
                  name="fechaRegistro"
                  value={formData.fechaRegistro}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.fechaRegistro ? "border-red-500" : "border-gray-300"
                  }`}
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
              title="Voluntario actualizado exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpdateVolunteer;
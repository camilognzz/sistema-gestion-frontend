import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

const CreateVolunteer: React.FC = () => {
  const navigate = useNavigate();

  // Estado inicial del formulario alineado con IVoluntario
  const [formData, setFormData] = useState<IVoluntario>({
    documentoIdentidad: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
    genero: null,
    profesion: "",
    disponibilidad: "TIEMPO_COMPLETO",
    fechaRegistro: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
        setErrors({ documentoIdentidad: "No se encontró un token de autenticación." });
        setIsLoading(false);
        return;
      }

      // Preparar datos para enviar (campos vacíos como null para el backend)
      const volunteerData: IVoluntario = {
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
      const response = await Volunteers.createVolunteer(volunteerData, token);
      console.log("Respuesta del backend:", JSON.stringify(response, null, 2));

      setIsSuccessModalOpen(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Error desconocido al crear el voluntario.";
        setErrors({ documentoIdentidad: message });
        console.error("Error del backend:", err.response?.data);
      } else {
        setErrors({ documentoIdentidad: "Error inesperado al crear el voluntario." });
        console.error("Error inesperado:", err);
      }
    } finally {
      setIsLoading(false);
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Voluntario</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="documentoIdentidad" className="block text-sm font-medium text-gray-700">
                  Documento de Identidad 
                </label>
                <input
                  type="number" // Cambiado de number a text para coincidir con IVoluntario
                  id="documentoIdentidad"
                  name="documentoIdentidad"
                  value={formData.documentoIdentidad}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.documentoIdentidad ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el documento de identidad"
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (Opcional)
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
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Teléfono 
                </label>
                <input
                  type="number" // Cambiado de number a text para coincidir con IVoluntario
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 ${
                    errors.telefono ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese el teléfono del voluntario"
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
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
              title="Voluntario guardado exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateVolunteer;
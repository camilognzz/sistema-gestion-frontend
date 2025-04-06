import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Contacts from "../service/Contacts"; 
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { IContacto } from "../contactspage/interface/IContacto";

const CreateContact: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IContacto>({
    id: 0, 
    nombre: "",
    tipoContacto: "INDIVIDUAL" as "INDIVIDUAL" | "EMPRESA",
    telefono: "",
    email: "",
    direccion: "",
    cargo: "",
    notas: "",
    fechaRegistro: new Date().toISOString().split("T")[0], 
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

      if (!formData.nombre.trim()) {
        setError("El nombre es obligatorio.");
        setIsLoading(false);
        return;
      }
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Por favor, ingresa un email válido.");
        setIsLoading(false);
        return;
      }
      if (!formData.telefono.trim()) {
        setError("El teléfono es obligatorio.");
        setIsLoading(false);
        return;
      }

      const contactData: IContacto = {
        nombre: formData.nombre,
        tipoContacto: formData.tipoContacto,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion || undefined,
        cargo: formData.cargo || undefined,
        notas: formData.notas || undefined,
        fechaRegistro: formData.fechaRegistro,
      };

      const response = await Contacts.createContact(contactData, token);
      console.log("Respuesta del backend:", JSON.stringify(response, null, 2));
      setIsLoading(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Error al crear contacto:", err);
      setError("Error desconocido al crear el contacto.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/contactos");
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/contactos");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Contacto</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese el nombre del contacto"
                />
              </div>

              <div>
                <label htmlFor="tipoContacto" className="block text-sm font-medium text-gray-700">
                  Tipo de Contacto
                </label>
                <select
                  id="tipoContacto"
                  name="tipoContacto"
                  value={formData.tipoContacto}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="EMPRESA">Empresa</option>
                </select>
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
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese el teléfono del contacto"
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese el email del contacto"
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
                  value={formData.direccion}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese la dirección del contacto"
                />
              </div>

              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                  Cargo (Opcional)
                </label>
                <input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese el cargo del contacto"
                />
              </div>

              <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
                  Notas (Opcional)
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  placeholder="Ingrese notas sobre el contacto"
                />
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
              title="Contacto guardado exitosamente"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateContact;
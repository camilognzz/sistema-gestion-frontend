import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Contacts from "../service/Contacts";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";
import { IContacto } from "../contactspage/interface/IContacto";

const UpdateContact: React.FC = () => {
  const navigate = useNavigate();
  const { contactId } = useParams<{ contactId: string }>();

  const [contactData, setContactData] = useState<IContacto>({
    id: 0,
    nombre: "",
    tipoContacto: "INDIVIDUAL" as "INDIVIDUAL" | "EMPRESA",
    telefono: "",
    email: "",
    direccion: "",
    cargo: "",
    notas: "",
    fechaRegistro: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contactId) {
      fetchContactDataById(contactId);
    }
  }, [contactId]);

  const fetchContactDataById = async (contactId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found.");
        setError("No se encontró un token de autenticación.");
        setLoading(false);
        return;
      }

      const response = await Contacts.getContactById(Number(contactId), token);
      console.log("✅ API Response:", response);

      if (response) {
        setContactData({
          id: response.id,
          nombre: response.nombre,
          tipoContacto: response.tipoContacto,
          telefono: response.telefono,
          email: response.email,
          direccion: response.direccion || "",
          cargo: response.cargo || "",
          notas: response.notas || "",
          fechaRegistro: response.fechaRegistro,
        });
        setLoading(false);
      } else {
        console.error("❌ No se encontró el contacto en la respuesta.");
        setError("No se encontró el contacto.");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error fetching contact data:", error);
      setError("Error al cargar los datos del contacto.");
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Token enviado:", token);
      if (!token) {
        setError("No se encontró un token de autenticación.");
        navigate("/login");
        return;
      }

      if (!contactId) {
        console.error("❌ contactId is undefined");
        setError("ID del contacto no definido.");
        return;
      }

      if (!contactData.nombre.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }
      if (!contactData.email.trim() || !/\S+@\S+\.\S+/.test(contactData.email)) {
        setError("Por favor, ingresa un email válido.");
        return;
      }
      if (!contactData.telefono.trim()) {
        setError("El teléfono es obligatorio.");
        return;
      }

      setUpdating(true);
      const updatedContact: IContacto = {
        id: contactData.id,
        nombre: contactData.nombre,
        tipoContacto: contactData.tipoContacto,
        telefono: contactData.telefono,
        email: contactData.email,
        direccion: contactData.direccion || undefined,
        cargo: contactData.cargo || undefined,
        notas: contactData.notas || undefined,
        fechaRegistro: contactData.fechaRegistro,
      };

      console.log("🔍 Enviando actualización:", updatedContact);
      await Contacts.updateContact(Number(contactId), updatedContact, token);
      console.log("✅ Contact updated");
      setUpdating(false);
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setIsSuccessModalOpen(false);
        navigate("/contactos");
      }, 2000);
    } catch (error: unknown) {
      console.error("❌ Error updating contact:", error);
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        setError("Sesión expirada o no autorizada. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Error al actualizar el contacto.");
      }
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate("/contactos");
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/contactos");
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
              Actualizar Contacto
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
                  value={contactData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Tipo de Contacto
                </label>
                <select
                  name="tipoContacto"
                  value={contactData.tipoContacto}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  required
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="EMPRESA">Empresa</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={contactData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={contactData.direccion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Cargo (Opcional)
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={contactData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Notas (Opcional)
                </label>
                <textarea
                  name="notas"
                  value={contactData.notas}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Fecha de Registro
                </label>
                <input
                  type="date"
                  name="fechaRegistro"
                  value={contactData.fechaRegistro}
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
          </div>

          <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={closeSuccessModal}
            title="Contacto Actualizado con Éxito"
          />
        </main>
      </div>
    </div>
  );
};

export default UpdateContact;
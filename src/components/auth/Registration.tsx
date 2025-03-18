import { useState } from "react";
import Users from "../service/Users"; // Ajusta la ruta si es necesario
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar"; // Ajusta la ruta si es necesario
import { SidebarItems } from "../common/SidebarItems"; // Ajusta la ruta si es necesario
import SuccessModal from "../modals/SuccessModal"; // Ajusta la ruta si es necesario
import { Eye, EyeOff } from "lucide-react"; // Instala lucide-react si no lo tienes

function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER", // Valor por defecto
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        alert("No authentication token found.");
        return;
      }

      setIsSubmitting(true);
      await Users.register(formData, token);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
      });

      setIsSubmitting(false);
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setIsSuccessModalOpen(false);
        navigate("/admin/user-management");
      }, 2000);
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred while registering user");
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/admin/user-management");
  };

  const handleCancel = () => {
    navigate("/admin/user-management");
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Registro de Usuario
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
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
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Registrando...
                    </>
                  ) : (
                    "Registrar"
                  )}
                </button>
              </div>
            {/*   <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Registrando...
                    </>
                  ) : (
                    "Registrar"
                  )}
                </button>
              </div> */}
            </form>
          </div>

          {/* Success Modal */}
          <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={closeSuccessModal}
            title="Usuario Registrado con Éxito"
          />
        </main>
      </div>
    </div>
  );
}

export default Registration;
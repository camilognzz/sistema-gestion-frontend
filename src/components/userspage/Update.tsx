import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Users from "../service/Users";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import SuccessModal from "../modals/SuccessModal";

function Update() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "USER", // Valor por defecto
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDataById(userId);
    }
  }, [userId]);

  const fetchUserDataById = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found.");
        return;
      }

      const response = await Users.getUserById(userId, token);
      console.log("✅ API Response:", response);

      if (response && response.user) {
        const { name = "", email = "", role = "" } = response.user;
        setUserData({ name, email, role });
        setLoading(false);
      } else {
        console.error("❌ No se encontró el usuario en la respuesta.");
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró un token de autenticación.");
        return;
      }

      if (!userId) {
        console.error("❌ userId is undefined");
        return;
      }

      setUpdating(true);
      await Users.updateUser(Number(userId), userData, token);
      console.log("✅ User updated");
      setUpdating(false);
      setIsSuccessModalOpen(true);

      // Cerrar la modal y redirigir después de 2 segundos
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        navigate("/admin/user-management");
      }, 2000);
    } catch (error) {
      console.error("❌ Error updating user profile:", error);
      alert("Error al actualizar el usuario");
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/user-management");
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/admin/user-management");
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
              Actualizar Usuario
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
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
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Rol
                </label>
                <select
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
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

          {/* Success Modal */}
          <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={closeSuccessModal}
            title="Usuario Actualizado con Éxito"
          />
        </main>
      </div>
    </div>
  );
}

export default Update;
import { Link, useNavigate } from "react-router-dom";
import Users from "../service/Users";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import ConfirmationModal from "../modals/ConfirmationModal";

function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isAuthenticated = Users.isAuthenticated();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user?.name) {
            setUserName(user.name);
            return;
          }
        } catch (error) {
          console.error("Error al leer el usuario de localStorage", error);
        }
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const user = await Users.getYourProfile(token);
          setUserName(user.name);
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.error("Error obteniendo el perfil:", error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    Users.logout();
    navigate("/login");
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <nav className="w-full bg-slate-50 shadow-md py-4 px-4 md:px-10 lg:px-20 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl md:text-2xl font-bold text-gray-600">
          Gestión Social
        </div>

        {/* Cuenta */}
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-gray-700 text-sm md:text-base font-medium">
            {userName ? `Bienvenido(a), ${userName}` : "Bienvenido(a)"}
          </span>
          <FaUserCircle
            className="text-xl md:text-2xl text-gray-600 hover:text-gray-800 cursor-pointer"
            onClick={toggleDrawer}
          />
        </div>
      </nav>

      {/* Drawer pequeño */}
      {isDrawerOpen && (
  <div 
    className="fixed inset-0 z-40"
    onClick={() => setIsDrawerOpen(false)} // Cierra el drawer al hacer clic fuera
  >
    <div
      className="absolute top-16 right-4 z-50 bg-slate-50 shadow-lg rounded-lg p-4 w-48"
      onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del drawer lo cierre
    >
      <div className="flex flex-col gap-2">
        <Link
          to="/profile"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-all"
          onClick={() => setIsDrawerOpen(false)} // Cierra el drawer después de hacer clic en un enlace
        >
          <FaUserCircle className="text-xl" />
          <span className="text-sm font-medium">Perfil</span>
        </Link>
        <hr className="my-2 border-gray-200" /> {/* Línea divisoria */}
        {isAuthenticated && (
          <button
            className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-all cursor-pointer"
            onClick={() => {
              setShowModal(true);
              setIsDrawerOpen(false); // Cierra el drawer antes de abrir el modal
            }}
          >
            <FaSignOutAlt className="text-xl" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        )}
      </div>
    </div>
  </div>
)}


      {/* Modal de confirmación reutilizable */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleLogout}
        title="¿Estás seguro de cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
      />
    </>
  );
}

export default Navbar;

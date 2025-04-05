import { Link, useNavigate } from "react-router-dom";
import Users from "../service/Users";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "../modals/ConfirmationModal";
import { useProfile } from "../context/ProfileContext"; // Ajusta la ruta

function Navbar() {
  const navigate = useNavigate();
  const { profile } = useProfile(); // Usamos el perfil del contexto
  const [showModal, setShowModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isAuthenticated = Users.isAuthenticated();
  const userName = profile?.name || null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    Users.logout();
    setShowModal(false);
    navigate("/login");
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <nav className="w-full bg-slate-50 shadow-md py-4 px-4 md:px-10 lg:px-20 flex justify-between items-center">
        <Link to={"/usuarios"}>
        <div className="text-xl md:text-2xl font-bold text-gray-600 hover:text-gray-800">
          Fundación Habacuc
        </div>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-gray-700 text-sm md:text-base font-medium">
            {userName ? `Bienvenido(a), ${userName.split(" ")[0]}` : "Bienvenido(a)"}
          </span>
          <FaUserCircle
            className="text-xl md:text-2xl text-gray-600 hover:text-gray-800 cursor-pointer"
            onClick={toggleDrawer}
          />
        </div>
      </nav>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="absolute top-16 right-4 z-50 bg-slate-50 shadow-lg rounded-lg p-4 w-48"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <Link
                to="/perfil"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-all"
                onClick={() => setIsDrawerOpen(false)}
              >
                <FaUserCircle className="text-xl" />
                <span className="text-sm font-medium">Perfil</span>
              </Link>
              <hr className="my-2 border-gray-200" />
              {isAuthenticated && (
                <button
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-all cursor-pointer"
                  onClick={() => {
                    setShowModal(true);
                    setIsDrawerOpen(false);
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
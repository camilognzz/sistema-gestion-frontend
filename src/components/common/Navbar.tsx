import { Link, useNavigate } from "react-router-dom";
import Users from "../service/Users";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
        <div className="absolute top-16 right-4 z-50 bg-slate-50 shadow-lg rounded-lg p-4 w-48">
          <div className="flex flex-col gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-all"
              onClick={toggleDrawer}
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
                  toggleDrawer();
                }}
              >
                <FaSignOutAlt className="text-xl" />
                <span className="text-sm font-medium">Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>
      )}
      {/* Modal de confirmación */}
      <Dialog open={showModal} onClose={setShowModal} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-lg shadow-xl p-6 w-80 sm:max-w-lg">
            <div className="flex items-center">
              <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                <ExclamationTriangleIcon className="size-6 text-red-600" />
              </div>
              <div className="ml-4 text-left">
                <DialogTitle className="text-lg font-bold text-gray-900">
                  ¿Estás seguro de cerrar sesión?
                </DialogTitle>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

export default Navbar;
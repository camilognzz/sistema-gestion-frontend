import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Users from "../service/Users";
import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";
import { UserCircle } from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

function Profile() {
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  const fetchProfileInfo = async () => {
    try {
      const token = localStorage.getItem("token") ?? "";
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response: UserProfile = await Users.getYourProfile(token);
      console.log("Perfil obtenido:", response);
      setProfileInfo(response);
    } catch (error) {
      console.error("Error fetching profile information:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <SidebarItems />
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mt-10 max-w-md mx-auto">
            {profileInfo ? (
              <>
                <div className="flex justify-center mb-4">
                  <UserCircle className="w-20 h-20 text-gray-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  {profileInfo.name}
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 text-center">
                    <span className="font-medium">Email:</span> {profileInfo.email}
                  </p>
                  <p className="text-gray-700 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        profileInfo.role === "ADMIN"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {profileInfo.role === "ADMIN" ? "Administrador" : "Usuario"}
                    </span>
                  </p>
                </div>
                {profileInfo.role === "ADMIN" && (
                  <div className="mt-6 flex justify-center">
                    <Link to={`/actualizar-usuario/${profileInfo.id}`}>
                      <button className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm">
                        Actualizar Perfil
                      </button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Cargando...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
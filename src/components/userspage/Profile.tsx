import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Users from '../service/Users';
import Navbar from '../common/Navbar';
import { SidebarItems } from '../common/SidebarItems';
import { UserCircle } from 'lucide-react';

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
      const token = localStorage.getItem('token') ?? '';

      if (!token) {
        console.error('No authentication token found.');
        return;
      }

      const response: UserProfile = await Users.getYourProfile(token);
      console.log('Perfil obtenido:', response);

      setProfileInfo(response);
    } catch (error) {
      console.error('Error fetching profile information:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <SidebarItems />

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col items-center justify-start pt-20 p-6">
          <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg text-center transform transition duration-300 hover:shadow-2xl">
            {/* Ícono de usuario */}
            <div className="flex justify-center">
              <UserCircle size={90} className="text-gray-600 mb-4" />
            </div>

            {/* Nombre del usuario */}
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">
              {profileInfo?.name ?? 'Cargando...'}
            </h2>

            {profileInfo ? (
              <>
                {/* Email */}
                <p className="text-lg text-gray-700 mb-4">
                  <strong>Email:</strong> {profileInfo.email}
                </p>

                {/* Rol del usuario */}
                <p className="text-lg font-medium">
                  <span
                    className={`px-4 py-2 rounded-full text-white text-sm tracking-wide ${
                      profileInfo.role === 'ADMIN' ? 'bg-blue-600' : 'bg-green-600'
                    }`}
                  >
                    {profileInfo.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </span>
                </p>

                {/* Botón de actualizar perfil */}
                {profileInfo.role === 'ADMIN' && (
                  <Link to={`/update-user/${profileInfo.id}`}>
                    <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-transform transform hover:scale-105 shadow-md">
                      Actualizar Perfil
                    </button>
                  </Link>
                )}
              </>
            ) : (
              <p className="text-gray-500">Cargando perfil...</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;

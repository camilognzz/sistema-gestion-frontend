import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Users from '../service/Users';
import Navbar from '../common/Navbar';
import Sidebar, { SidebarItem } from '../common/Sidebar';
import { User, Briefcase, Mail, Users as UsersIcon, DollarSign, UserCircle } from "lucide-react"; // Importar iconos

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
      <div className="flex">
        {/* Sidebar con las opciones en el orden solicitado */}
        <Sidebar>
          {profileInfo?.role === 'ADMIN' && (
            <Link to={"/admin/user-management"}><SidebarItem icon={<User size={20} />} text="Usuarios" /></Link>
          )}
          <SidebarItem icon={<Briefcase size={20} />} text="Proyectos" />
          <SidebarItem icon={<Mail size={20} />} text="Contactos" />
          <SidebarItem icon={<UsersIcon size={20} />} text="Voluntarios" />
          {profileInfo?.role === 'ADMIN' && (
            <SidebarItem icon={<DollarSign size={20} />} text="Finanzas" />
          )}
        </Sidebar>

        {/* Contenido principal con icono de usuario */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
            <UserCircle size={80} className="text-gray-400 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-gray-800 mb-2">{profileInfo?.name ?? "Cargando..."}</h2>

            {profileInfo ? (
              <>
                <p className="text-lg text-gray-700"><strong>Email:</strong> {profileInfo.email}</p>
                <p className="text-lg font-medium mt-2">
                  <span className={`px-3 py-1 rounded-md text-white ${profileInfo.role === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {profileInfo.role}
                  </span>
                </p>

                {profileInfo.role === 'ADMIN' && (
                  <Link to={`/update-user/${profileInfo.id}`}>
                    <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">
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

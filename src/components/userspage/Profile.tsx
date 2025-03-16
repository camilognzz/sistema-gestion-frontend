import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Users from '../service/Users';
import Navbar from '../common/Navbar';
import Sidebar, { SidebarItem } from '../common/Sidebar';
import { User, Briefcase, Mail, Users as UsersIcon, DollarSign } from "lucide-react"; // Importar iconos

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
          {/* Usuarios (solo para administradores) */}
          {profileInfo?.role === 'ADMIN' && (
            <SidebarItem icon={<User size={20} />} text="Usuarios" />
          )}

          <SidebarItem icon={<Briefcase size={20} />} text="Proyectos" />
          <SidebarItem icon={<Mail size={20} />} text="Contactos" />
          <SidebarItem icon={<UsersIcon size={20} />} text="Voluntarios" />

          {/* Finanzas (solo para administradores) */}
          {profileInfo?.role === 'ADMIN' && (
            <SidebarItem icon={<DollarSign size={20} />} text="Finanzas" />
          )}
        </Sidebar>

        {/* Contenido principal */}
        <div className="p-6 flex-1">
          <h2 className="text-xl font-bold">Información del Perfil</h2>
          {profileInfo ? (
            <>
              <p><strong>Nombre:</strong> {profileInfo.name}</p>
              <p><strong>Email:</strong> {profileInfo.email}</p>
              {profileInfo.role === 'ADMIN' && (
                <button className="mt-4 p-2 bg-blue-500 text-white rounded">
                  <Link to={`/update-user/${profileInfo.id}`}>Actualizar Perfil</Link>
                </button>
              )}
            </>
          ) : (
            <p>Cargando perfil...</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;

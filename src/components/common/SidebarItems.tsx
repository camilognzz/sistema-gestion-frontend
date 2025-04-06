import Sidebar, { SidebarItem } from "../common/Sidebar";
import { User, Briefcase, Mail, Users as UsersIcon, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

export const SidebarItems = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar>
        {profile?.role === "ADMIN" && (
          <Link to="/usuarios">
            <SidebarItem icon={<User size={20} />} text="Usuarios" />
          </Link>
        )}
        <Link to="/proyectos">
          <SidebarItem icon={<Briefcase size={20} />} text="Proyectos" />
        </Link>
        <Link to="/contactos">
          <SidebarItem icon={<Mail size={20} />} text="Contactos" />
        </Link>
        <Link to="/voluntarios">
          <SidebarItem icon={<UsersIcon size={20} />} text="Voluntarios" />
        </Link>
        {profile?.role === "ADMIN" && (
          <Link to="/finanzas">
            <SidebarItem icon={<DollarSign size={20} />} text="Finanzas" />
          </Link>
        )}
      </Sidebar>
    </div>
  );
};
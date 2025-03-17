import { useEffect, useState } from "react";
import Sidebar, { SidebarItem } from "../common/Sidebar";
import { User, Briefcase, Mail, Users as UsersIcon, DollarSign } from "lucide-react";
import Users from "../service/Users";
import { Link } from "react-router-dom";


interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
  }

export const SidebarItems = () => {
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
        <div>
            <Sidebar>
                {profileInfo?.role === "ADMIN" && (
                    <Link to={"/admin/user-management"}>
                        <SidebarItem icon={<User size={20} />} text="Usuarios" />
                    </Link>
                )}
                <SidebarItem icon={<Briefcase size={20} />} text="Proyectos" />
                <SidebarItem icon={<Mail size={20} />} text="Contactos" />
                <SidebarItem icon={<UsersIcon size={20} />} text="Voluntarios" />
                {profileInfo?.role === "ADMIN" && (
                    <SidebarItem icon={<DollarSign size={20} />} text="Finanzas" />
                )}
            </Sidebar>
        </div>
    )
}

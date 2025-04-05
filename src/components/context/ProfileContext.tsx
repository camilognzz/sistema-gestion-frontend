import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Users from "../service/Users";
import { ProfileContextType, UserProfile } from "./interface/IProfileContext";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        const token = localStorage.getItem("token") ?? "";
        if (!token) {
          console.error("No authentication token found.");
          setLoading(false);
          return;
        }

        const response: UserProfile = await Users.getYourProfile(token);
        console.log("Perfil obtenido:", response);
        setProfile(response);
      } catch (error) {
        console.error("Error fetching profile information:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileInfo();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
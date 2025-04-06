import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Users from "../service/Users";
import { ProfileContextType, UserProfile } from "./interface/IProfileContext";


const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const INACTIVITY_TIMEOUT = 1 * 60 * 60 * 1000; 
  const MODAL_DISPLAY_TIME = 3 * 1000; 

  const fetchProfileInfo = async () => {
    try {
      const token = localStorage.getItem("token") ?? "";
      if (!token) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const response: UserProfile = await Users.getYourProfile(token);
      setProfile(response);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setProfile(null);
    setShowInactivityModal(false);
    setInactivityTimer(null);
    navigate("/login");
  };

  const startInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    if (profile) {
      const timer = setTimeout(() => {
        setShowInactivityModal(true);
        setTimeout(() => {
          logout();
        }, MODAL_DISPLAY_TIME);
      }, INACTIVITY_TIMEOUT);
      setInactivityTimer(timer);
    }
  };

  const handleActivity = () => {
    startInactivityTimer(); 
  };

  useEffect(() => {
    fetchProfileInfo();

    
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, []); 

  useEffect(() => {
    startInactivityTimer(); 
  }, [profile]);

  const updateProfile = async () => {
    setLoading(true);
    await fetchProfileInfo();
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, logout, updateProfile }}>
      <>
        {children}
        {showInactivityModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500/75 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm mx-auto">
              <h2 className="text-xl font-semibold mb-4">Sesión expirada</h2>
              <p className="text-gray-700">Tu sesión ha expirado por inactividad.</p>
              <p className="text-sm text-gray-500 mt-2">Redirigiendo al login en unos segundos...</p>
            </div>
          </div>
        )}
      </>
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
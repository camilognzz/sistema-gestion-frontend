import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Users from "../service/Users";
import { useNavigate } from "react-router-dom";
import { ProfileContextType, UserProfile } from "./interface/IProfileContext";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const navigate = useNavigate();
  const INACTIVITY_TIMEOUT = 5 * 1000; // 2 horas
  const MODAL_DISPLAY_TIME = 5000; // 5 segundos

  let inactivityTimer: ReturnType<typeof setTimeout>;

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
    } catch (error) {
      console.error("Error fetching profile information:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setProfile(null);
    navigate("/login");
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      if (profile) {
        console.log("⏰ Tiempo de inactividad alcanzado. Mostrando modal...");
        setShowInactivityModal(true);
        setTimeout(() => {
          logout();
        }, MODAL_DISPLAY_TIME);
      }
    }, INACTIVITY_TIMEOUT);
  };

  const handleActivity = () => {
    resetInactivityTimer();
  };

  useEffect(() => {
    fetchProfileInfo();
    resetInactivityTimer();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, []);

  const updateProfile = async () => {
    setLoading(true);
    await fetchProfileInfo();
    resetInactivityTimer();
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      <>
        {children}
        {showInactivityModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
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

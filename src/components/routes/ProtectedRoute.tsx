import { Navigate, Outlet } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

export const ProtectedRoute = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
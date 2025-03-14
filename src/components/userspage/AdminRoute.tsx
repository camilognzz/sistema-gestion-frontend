import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Users from "../service/Users";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return Users.adminOnly() ? children : <Navigate to="/login" />;
};

export default AdminRoute;

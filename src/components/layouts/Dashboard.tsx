import Navbar from "../common/Navbar";
import { SidebarItems } from "../common/SidebarItems";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar fijo a la izquierda */}
      <div className="w-64">
        <SidebarItems />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import { ChevronLast, ChevronFirst } from "lucide-react";
import { useContext, createContext, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom"; // Para detectar la ruta activa

interface SidebarContextType {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void; // Añadimos setExpanded al contexto
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProps {
  children: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState<boolean>(false); // Cerrado por defecto

  return (
    <aside className="h-screen fixed">
      <nav className="h-full flex flex-col bg-slate-50 shadow-sm">
        {/* Header */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="/images/logo-f-h-2-r.png"
            className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`}
            alt="Logo"
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        {/* Proveedor del contexto */}
        <SidebarContext.Provider value={{ expanded, setExpanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>
      </nav>
    </aside>
  );
}

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
}

export function SidebarItem({ icon, text, alert = false }: SidebarItemProps) {
  const context = useContext(SidebarContext);
  const location = useLocation(); // Para detectar la ruta actual

  if (!context) {
    throw new Error("SidebarItem debe usarse dentro de un SidebarContext.Provider");
  }

  const { expanded, setExpanded } = context;
  const isActive = location.pathname.includes(text.toLowerCase()); // Marcar como activo si la ruta coincide

  const handleClick = () => {
    if (!expanded) {
      setExpanded(false); // Expandir el sidebar al hacer clic en un ítem si está cerrado
    }
  };

  return (
    <li
      onClick={handleClick} // Expandir al hacer clic
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          isActive
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"
        }
      `}
    >
      {icon}
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
        {text}
      </span>

      {alert && (
        <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`} />
      )}

      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}
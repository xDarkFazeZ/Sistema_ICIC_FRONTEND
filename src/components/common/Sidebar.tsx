import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Avatar,
  Switch,
  Divider,
  Button,
} from "@heroui/react";
import {
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import useDrawer from "../../hooks/useDrawer";

const IconCursos = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);
const IconInstructores = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
    <path d="m14.5 14.5 2 2 4-4" />
  </svg>
);
const IconParticipantes = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  description: string;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: <ChartBarIcon className="w-5 h-5" />, route: "/dashboard", description: "Vista general del sistema", badge: "Principal" },
  { key: "cursos", label: "Cursos", icon: <IconCursos />, route: "/cursos", description: "Gestión de cursos e inscripciones" },
  { key: "instructores", label: "Instructores", icon: <IconInstructores />, route: "/instructores", description: "Alta y gestión de instructores" },
  { key: "participantes", label: "Participantes", icon: <IconParticipantes />, route: "/participantes", description: "Administración de participantes" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { drawerOpen, toggle, setDrawerOpen } = useDrawer();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = () => {
    if (!user) return "U";
    return `${(user.nombre || "").charAt(0)}${(user.apellidoPaterno || "").charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    // small delay to show animation
    setTimeout(() => { logout(); navigate('/login'); }, 200);
  };

  return (
    <>
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-in-out
          ${drawerOpen ? "w-72" : "w-20"}
          z-40 flex flex-col shadow-xl
        `}
      >
        {/* Hamburger always visible */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={toggle}
            className="p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
            aria-label="Abrir/cerrar menú"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          {drawerOpen && (
            <img
              src="/src/assets/images/logo.png"
              alt="Logo ICIC"
              className="ml-3 h-10 w-auto object-contain"
            />
          )}
        </div>

        {/* Perfil de usuario */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 transition-all duration-300 ${drawerOpen ? "" : "justify-center"}`}>
          <Avatar name={getInitials()} size={drawerOpen ? "lg" : "md"} className="bg-gradient-to-br from-red-500 to-red-700 text-white font-semibold flex-shrink-0" isBordered color="danger" />
          {drawerOpen && (
            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left duration-300">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.fullName || `${user?.nombre} ${user?.apellidoPaterno}`}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">{user?.puesto || "Usuario"}</p>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">{user?.rol?.nombre || "Sin rol"}</div>
            </div>
          )}
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname.startsWith(item.route);
              return (
                <button key={item.key} onClick={() => navigate(item.route)} title={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-950" : "hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"} ${drawerOpen ? "justify-start" : "justify-center"}`}
                >
                  <span className="flex-shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                  {drawerOpen && (
                    <div className="text-left animate-in fade-in slide-in-from-left duration-300 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${isActive ? "bg-white/20 text-white" : "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"}`}>{item.badge}</span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isActive ? "text-red-100" : "text-gray-400 dark:text-gray-500"}`}>{item.description}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <div className={`flex items-center gap-3 ${drawerOpen ? "justify-between" : "justify-center"}`}>
            {drawerOpen && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo oscuro</span>}
            <Switch isSelected={isDark} onValueChange={toggleTheme} size="sm" classNames={{ wrapper: "group-data-[selected=true]:bg-red-600" }} startContent={<SunIcon className="w-3 h-3 text-yellow-500" />} endContent={<MoonIcon className="w-3 h-3 text-blue-400" />} />
          </div>
          <Divider />
          <Button color="danger" variant="flat" onPress={handleLogout} className={`w-full font-medium ${drawerOpen ? "" : "min-w-0 px-3"}`} startContent={!drawerOpen && <ArrowRightOnRectangleIcon className="w-5 h-5" />}>
            {drawerOpen && (
              <div className="flex items-center gap-2">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </div>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}

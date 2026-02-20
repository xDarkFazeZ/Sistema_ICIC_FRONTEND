import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spinner,
  Avatar,
  Switch,
  Divider,
  Chip,
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
  PlusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

// Importar modales (en minúsculas como tus archivos)
import CursoModal from "../components/modals/Cursos/cursosModal";
import InstructorModal from "../components/modals/Instructor/instructorModal";
import ParticipanteModal from "../components/modals/Participante/participanteModal";

// ── Íconos SVG extra ──────────────────────────────────────────────────────────
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

// ── Tipos ─────────────────────────────────────────────────────────────────────
type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  description: string;
  badge?: string;
};

// ── Navegación principal ─────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <ChartBarIcon className="w-5 h-5" />,
    route: "/dashboard",
    description: "Vista general del sistema",
  },
  {
    key: "cursos",
    label: "Cursos",
    icon: <IconCursos />,
    route: "/cursos",
    description: "Gestión de cursos e inscripciones",
    badge: "Principal",
  },
  {
    key: "instructores",
    label: "Instructores",
    icon: <IconInstructores />,
    route: "/instructores",
    description: "Alta y gestión de instructores",
  },
  {
    key: "participantes",
    label: "Participantes",
    icon: <IconParticipantes />,
    route: "/participantes",
    description: "Administración de participantes",
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Estados para los modales
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [modalInstructorAbierto, setModalInstructorAbierto] = useState(false);
  const [modalParticipanteAbierto, setModalParticipanteAbierto] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeNav, setActiveNav] = useState<string>("dashboard");

  const handleLogout = async () => {
    setLoggingOut(true);
    setTimeout(() => { logout(); navigate("/login"); }, 800);
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${(user.nombre || "").charAt(0)}${(user.apellidoPaterno || "").charAt(0)}`.toUpperCase();
  };

  const handleNav = (route: string, key: string) => {
    setActiveNav(key);
    navigate(route);
  };

  // Manejadores de éxito para los modales
  const handleCursoCreado = (nuevoCurso: any) => {
    console.log("Curso creado:", nuevoCurso);
    setModalCursoAbierto(false);
    // Aquí puedes mostrar una notificación de éxito
  };

  const handleInstructorCreado = (nuevoInstructor: any) => {
    console.log("Instructor creado:", nuevoInstructor);
    setModalInstructorAbierto(false);
  };

  const handleParticipanteCreado = (nuevoParticipante: any) => {
    console.log("Participante creado:", nuevoParticipante);
    setModalParticipanteAbierto(false);
  };

  // ── Spinner logout ────────────────────────────────────────────────────────
  if (loggingOut) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-20">
            <div className="w-32 h-32 bg-red-600 rounded-full animate-pulse" />
          </div>
          <Spinner size="lg" color="danger" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium animate-pulse">Cerrando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black flex">

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-in-out
          ${drawerOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-20"}
          z-40 flex flex-col shadow-xl
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0 lg:opacity-100"}`}>
            <img
              src="/src/assets/images/logo.png"
              alt="ICIC Logo"
              className={`transition-all duration-300 ${drawerOpen ? "w-12" : "w-10"}`}
            />
            {drawerOpen && (
              <div className="animate-in fade-in slide-in-from-left duration-300">
                <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700">
                  ICIC
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestión</p>
              </div>
            )}
          </div>
        </div>

        {/* Perfil de usuario */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className={`flex items-center gap-4 transition-all duration-300 ${drawerOpen ? "" : "justify-center"}`}>
            <Avatar
              name={getInitials()}
              size={drawerOpen ? "lg" : "md"}
              className="bg-gradient-to-br from-red-500 to-red-700 text-white font-semibold flex-shrink-0"
              isBordered
              color="danger"
            />
            {drawerOpen && (
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left duration-300">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {user?.fullName || `${user?.nombre} ${user?.apellidoPaterno}`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">{user?.puesto || "Usuario"}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                  {user?.rol?.nombre || "Sin rol"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => handleNav(item.route, item.key)}
                title={!drawerOpen ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${activeNav === item.key
                    ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-950"
                    : "hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  }
                  ${drawerOpen ? "justify-start" : "justify-center"}
                `}
              >
                <span className="flex-shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                {drawerOpen && (
                  <div className="text-left animate-in fade-in slide-in-from-left duration-300 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${activeNav === item.key
                            ? "bg-white/20 text-white"
                            : "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${activeNav === item.key ? "text-red-100" : "text-gray-400 dark:text-gray-500"
                      }`}>
                      {item.description}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <div className={`flex items-center gap-3 ${drawerOpen ? "justify-between" : "justify-center"}`}>
            {drawerOpen && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Modo oscuro
              </span>
            )}
            <Switch
              isSelected={isDark}
              onValueChange={toggleTheme}
              size="sm"
              classNames={{ wrapper: "group-data-[selected=true]:bg-red-600" }}
              startContent={<SunIcon className="w-3 h-3 text-yellow-500" />}
              endContent={<MoonIcon className="w-3 h-3 text-blue-400" />}
            />
          </div>
          <Divider />
          <Button
            color="danger"
            variant="flat"
            onPress={handleLogout}
            className={`w-full font-medium ${drawerOpen ? "" : "min-w-0 px-3"}`}
            startContent={!drawerOpen && <ArrowRightOnRectangleIcon className="w-5 h-5" />}
          >
            {drawerOpen && (
              <div className="flex items-center gap-2">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </div>
            )}
          </Button>
        </div>
      </aside>

      {/* Toggle sidebar */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 lg:left-auto lg:right-4"
      >
        {drawerOpen
          ? <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          : <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        }
      </button>

      {/* Overlay móvil */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-in fade-in duration-300"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* CONTENIDO PRINCIPAL - Dashboard */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header con bienvenida */}
          <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
            <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700 mb-2">
              ¡Bienvenido, {user?.nombre}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Panel de control · {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Acciones rápidas */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AcademicCapIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Acciones rápidas
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Alta de Participante */}
              <Card
                isPressable
                onPress={() => setModalParticipanteAbierto(true)}
                className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:border-red-300 dark:hover:border-red-800 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                      Dar de alta Participante
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Registra un nuevo participante en el sistema
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all duration-200">
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Nuevo participante</span>
                  <ArrowRightIcon className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>

              {/* Alta de Instructor */}
              <Card
                isPressable
                onPress={() => setModalInstructorAbierto(true)}
                className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:border-red-300 dark:hover:border-red-800 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                      Dar de alta Instructor
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Agrega un nuevo instructor al catálogo
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all duration-200">
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Nuevo instructor</span>
                  <ArrowRightIcon className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>

              {/* Alta de Curso */}
              <Card
                isPressable
                onPress={() => setModalCursoAbierto(true)}
                className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:border-red-300 dark:hover:border-red-800 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                      Dar de alta Curso
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Crea y programa un nuevo curso
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 group-hover:gap-2 transition-all duration-200">
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Nuevo curso</span>
                  <ArrowRightIcon className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>

            </div>
          </div>

          {/* Estadísticas y actividad reciente (igual) */}
          {/* ... */}
        </div>
      </main>

      {/* MODALES */}
      <CursoModal
        isOpen={modalCursoAbierto}
        onClose={() => setModalCursoAbierto(false)}
        onSuccess={handleCursoCreado}
      />

      <InstructorModal
        isOpen={modalInstructorAbierto}
        onClose={() => setModalInstructorAbierto(false)}
        onSuccess={handleInstructorCreado}
      />

      <ParticipanteModal
        isOpen={modalParticipanteAbierto}
        onClose={() => setModalParticipanteAbierto(false)}
        onSuccess={handleParticipanteCreado}
      />
    </div>
  );
}
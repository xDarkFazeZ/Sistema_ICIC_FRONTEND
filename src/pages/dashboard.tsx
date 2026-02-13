import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  Button, 
  Spinner, 
  Avatar, 
  Switch,
  Divider
} from "@heroui/react";
import { 
  SunIcon, 
  MoonIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [loggingOut, setLoggingOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleLogout = async () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 800);
  };

  // Obtener iniciales del nombre completo
  const getInitials = () => {
    if (!user) return "U";
    const nombre = user.nombre || "";
    const apellido = user.apellidoPaterno || "";
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  // ✅ Spinner de cierre de sesión
  if (loggingOut) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-20">
            <div className="w-32 h-32 bg-red-600 rounded-full animate-pulse"></div>
          </div>
          <Spinner size="lg" color="danger" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium animate-pulse">
          Cerrando sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black flex">
      
      {/* ============================================
          DRAWER LATERAL
          ============================================ */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-in-out
          ${drawerOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-20"}
          z-40 flex flex-col
          shadow-xl
        `}
      >
        {/* Logo en la parte superior */}
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
                  Sistema ICIC
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Panel de Control
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Avatar y datos del usuario */}
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
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">
                  {user?.puesto || "Usuario"}
                </p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                  {user?.rol?.nombre || "Sin rol"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            
            {/* Registro de Eventos */}
            <button
              onClick={() => navigate("/eventos")} // Ruta futura
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                hover:bg-red-50 dark:hover:bg-red-950/30
                hover:text-red-600 dark:hover:text-red-400
                text-gray-700 dark:text-gray-300
                group
                ${drawerOpen ? "justify-start" : "justify-center"}
              `}
            >
              <CalendarIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {drawerOpen && (
                <span className="font-medium animate-in fade-in slide-in-from-left duration-300">
                  Registro de Eventos
                </span>
              )}
            </button>

            {/* Aquí puedes agregar más opciones del menú en el futuro */}
            
          </div>
        </nav>

        {/* Controles inferiores: Theme Toggle + Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          
          {/* Switch de modo oscuro */}
          <div className={`flex items-center gap-3 ${drawerOpen ? "justify-between" : "justify-center"}`}>
            {drawerOpen && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-in fade-in slide-in-from-left duration-300">
                Modo oscuro
              </span>
            )}
            <Switch
              isSelected={isDark}
              onValueChange={toggleTheme}
              size="sm"
              classNames={{
                wrapper: "group-data-[selected=true]:bg-red-600"
              }}
              startContent={<SunIcon className="w-3 h-3 text-yellow-500" />}
              endContent={<MoonIcon className="w-3 h-3 text-blue-400" />}
            />
          </div>

          <Divider className="my-2" />

          {/* Botón de cerrar sesión */}
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

      {/* Botón toggle del drawer (visible en desktop también) */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 lg:left-auto lg:right-4"
      >
        {drawerOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Overlay para móvil */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-in fade-in duration-300"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ============================================
          CONTENIDO PRINCIPAL
          ============================================ */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
            <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700 mb-2">
              Bienvenido al Sistema ICIC
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Panel de administración y gestión
            </p>
          </div>

          {/* Tarjeta de bienvenida */}
          <Card className="p-8 mb-6 shadow-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm animate-in fade-in zoom-in duration-500 delay-200">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">👋</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                ¡Hola, {user?.nombre}!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Has iniciado sesión correctamente en el sistema
              </p>

              {/* Información del usuario */}
              <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Correo electrónico
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.correo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Puesto
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.puesto || "No asignado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Rol en el sistema
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.rol?.nombre || "Sin rol"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Estado
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        Activo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Grid de estadísticas o accesos rápidos (ejemplo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
            
            {/* Card 1 - Ejemplo */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-950 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Próximos eventos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    12
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 2 - Ejemplo */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Participantes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    248
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 3 - Ejemplo */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cursos activos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    8
                  </p>
                </div>
              </div>
            </Card>

          </div>

        </div>
      </main>
    </div>
  );
}
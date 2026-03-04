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

import Sidebar from "../components/common/Sidebar";
// Sidebar moved to reusable component

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Estados para los modales
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [modalInstructorAbierto, setModalInstructorAbierto] = useState(false);
  const [modalParticipanteAbierto, setModalParticipanteAbierto] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setTimeout(() => { logout(); navigate("/login"); }, 800);
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${(user.nombre || "").charAt(0)}${(user.apellidoPaterno || "").charAt(0)}`.toUpperCase();
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

      <Sidebar />

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
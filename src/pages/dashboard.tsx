import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Spinner,
} from "@heroui/react";
import {
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { sileo } from "sileo";

// Importar modales
import CursoModal from "../components/modals/Cursos/cursosModal";
import InstructorModal from "../components/modals/Instructor/instructorModal";
import ParticipanteModal from "../components/modals/Participante/participanteModal";
import ParticipanteDetalleModal from "../components/modals/Participante/participanteDetalleModal";
import EstadoPagoModal from "../components/modals/Inscripcion/estadoPagoModal";

import Sidebar from "../components/common/Sidebar";

// Importar servicios y componentes de gráficos
import { dashboardService } from "../services/dashboardService";
import GraficoBarras from "../components/dashboard/GraficosBarras";
import GraficoPastel from "../components/dashboard/GraficoPastel";
import CalendarioCursos from "../components/dashboard/CalendarioCursos";
import TablaPagosPendientes from "../components/dashboard/TablaPagosPendientes";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Estados para datos del dashboard
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    inscripcionesPorMes: [],
    distribucionCursos: [],
    cursosConEstado: [],
    pagosPendientes: []
  });

  // Estados para los modales
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [modalInstructorAbierto, setModalInstructorAbierto] = useState(false);
  const [modalParticipanteAbierto, setModalParticipanteAbierto] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Estados para modales de pago
  const [detalleParticipanteModal, setDetalleParticipanteModal] = useState({
    isOpen: false,
    participante: null as any
  });

  const [estadoPagoModal, setEstadoPagoModal] = useState({
    isOpen: false,
    inscripciones: [] as any[],
    nombreParticipante: ""
  });

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    setTimeout(() => { logout(); navigate("/login"); }, 800);
  };

  // Manejadores de éxito para los modales
  const handleCursoCreado = async (nuevoCurso: any) => {
    console.log("Curso creado:", nuevoCurso);
    setModalCursoAbierto(false);
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error recargando datos:', error);
    }
  };

  const handleInstructorCreado = async (nuevoInstructor: any) => {
    console.log("Instructor creado:", nuevoInstructor);
    setModalInstructorAbierto(false);
  };

  const handleParticipanteCreado = async (nuevoParticipante: any) => {
    console.log("Participante creado:", nuevoParticipante);
    setModalParticipanteAbierto(false);
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error recargando datos:', error);
    }
  };

  // Manejadores para la tabla de pagos
  const handleVerDetalle = (pago: any) => {
    setDetalleParticipanteModal({
      isOpen: true,
      participante: {
        ...pago.participante,
        id: pago.participante?.id || pago.id,
        inscripciones: [{
          id: pago.id,
          curso: pago.curso,
          estadoPago: pago.estadoPago,
          montoFinal: pago.montoEsperado,
          fechaPago: pago.inscritoEn
        }]
      }
    });
  };


  const handleRegistrarPago = (pago: any) => {
    setEstadoPagoModal({
      isOpen: true,
      inscripciones: [{
        id: pago.id,
        curso: pago.curso,
        estadoPago: "PENDIENTE",
        montoFinal: pago.montoEsperado,
        montoPagado: 0,
        fechaPago: pago.inscritoEn
      }],
      nombreParticipante: `${pago.participante?.nombre} ${pago.participante?.apellidoPaterno}`
    });
  };

  const handleCancelarInscripcion = (pago: any) => {
    if (window.confirm(`¿Estás seguro de cancelar la inscripción de ${pago.participante?.nombre}?`)) {
      console.log('Cancelar inscripción:', pago);
      sileo.success({
        title: "Inscripción cancelada",
        description: "La inscripción ha sido cancelada exitosamente"
      });
    }
  };

  // Spinner logout
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

          {/* SECCIÓN DE GRÁFICOS Y ESTADÍSTICAS */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" color="danger" />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Gráfico de Barras - Inscripciones por Mes */}
              {dashboardData.inscripcionesPorMes.length > 0 && (
                <Card className="p-6 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <ChartBarIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Inscripciones por Mes
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Últimos 12 meses
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <div style={{ minWidth: dashboardData.inscripcionesPorMes.length > 6 ? `${dashboardData.inscripcionesPorMes.length * 60}px` : '100%' }}>
                      <GraficoBarras data={dashboardData.inscripcionesPorMes} />
                    </div>
                  </div>
                </Card>
              )}

              {/* Gráfico de Pastel - Distribución por Curso */}
              {dashboardData.distribucionCursos.length > 0 && (
                <Card className="p-6 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Distribución por Curso
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Participantes inscritos por curso
                      </p>
                    </div>
                  </div>
                  <GraficoPastel data={dashboardData.distribucionCursos} />
                </Card>
              )}

              {/* Calendario de Cursos - ancho completo */}
              {dashboardData.cursosConEstado.length > 0 && (
                <Card className="p-6 bg-white dark:bg-gray-900 xl:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Calendario de Cursos
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Visualiza los cursos por fecha
                      </p>
                    </div>
                  </div>
                  <CalendarioCursos cursos={dashboardData.cursosConEstado} />
                </Card>
              )}

              {/* Tabla de Pagos Pendientes - ocupa ambas columnas */}
              <Card className="p-6 bg-white dark:bg-gray-900 xl:col-span-2">
                <TablaPagosPendientes
                  pagosPendientes={dashboardData.pagosPendientes}
                  onVerDetalle={handleVerDetalle}
                  onRegistrarPago={handleRegistrarPago}
                  onCancelarInscripcion={handleCancelarInscripcion}
                />
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* MODALES - Todos dentro del div principal */}
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

      <ParticipanteDetalleModal
        isOpen={detalleParticipanteModal.isOpen}
        onClose={() => setDetalleParticipanteModal({ isOpen: false, participante: null })}
        participante={detalleParticipanteModal.participante}
      />

      <EstadoPagoModal
        isOpen={estadoPagoModal.isOpen}
        onClose={() => setEstadoPagoModal({ isOpen: false, inscripciones: [], nombreParticipante: "" })}
        inscripciones={estadoPagoModal.inscripciones}
        nombreParticipante={estadoPagoModal.nombreParticipante}
        onSuccess={(inscripcionActualizada) => {
          const fetchDashboardData = async () => {
            try {
              const data = await dashboardService.getDashboardData();
              setDashboardData(data);
            } catch (error) {
              console.error('Error recargando datos:', error);
            }
          };
          fetchDashboardData();
        }}
      />
    </div>
  );
}
import { useState } from "react";
import { Button } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/solid";

import CursoModal from "../../components/modals/Cursos/cursosModal";
import InstructorModal from "../../components/modals/Instructor/instructorModal";
import ParticipanteModal from "../../components/modals/Participante/participanteModal";
import SiguientePasoModal, {
  type SiguientePasoOpcion,
} from "../../components/common/siguientePasoModal";

// ── Íconos SVG inline ─────────────────────────────────────────────────────────
const IcoInstructor = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 1 0-16 0" />
    <path d="m14.5 14.5 2 2 4-4" />
  </svg>
);

const IcoParticipante = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ── Componente ────────────────────────────────────────────────────────────────
export default function Cursos() {
  // ── Estados de modales ───────────────────────────────────────────────────
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [modalInstructorAbierto, setModalInstructorAbierto] = useState(false);
  const [modalParticipanteAbierto, setModalParticipanteAbierto] = useState(false);
  const [siguientePasoAbierto, setSiguientePasoAbierto] = useState(false);

  // Guardamos el nombre del curso recién creado para mostrarlo en el modal
  const [cursoCreadoNombre, setCursoCreadoNombre] = useState("");

  // ── Handler: curso creado exitosamente ───────────────────────────────────
  const handleCursoCreado = (nuevoCurso: any) => {
    setCursoCreadoNombre(nuevoCurso?.nombre ?? "El curso");
    // Abrir el modal de siguiente paso tras un pequeño delay
    // para que la notificación de Sileo sea visible primero
    setTimeout(() => setSiguientePasoAbierto(true), 400);
  };

  // ── Opciones del SiguientePasoModal ──────────────────────────────────────
  const opcionesSiguientePaso: SiguientePasoOpcion[] = [
    {
      label: "Agregar Instructor",
      descripcion: "Asigna o da de alta un instructor para este curso",
      icono: <IcoInstructor />,
      color: "from-emerald-400 to-teal-500",
      onClick: () => setModalInstructorAbierto(true),
    },
    {
      label: "Agregar Participantes",
      descripcion: "Inscribe participantes al curso recién creado",
      icono: <IcoParticipante />,
      color: "from-blue-500 to-indigo-600",
      onClick: () => setModalParticipanteAbierto(true),
    },
  ];

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* ── Encabezado de página ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700">
            Cursos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Gestión de cursos e inscripciones
          </p>
        </div>

        <Button
          onPress={() => setModalCursoAbierto(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          startContent={<PlusIcon className="w-4 h-4" />}
        >
          Nuevo Curso
        </Button>
      </div>

      {/* ── Aquí va tu tabla de cursos ───────────────────────────────────── */}
      {/* <TablaCursos /> */}

      {/* ════════════════════════════════════════════════════════════════════
          MODALES
      ════════════════════════════════════════════════════════════════════ */}

      {/* 1. Crear / editar curso */}
      <CursoModal
        isOpen={modalCursoAbierto}
        onClose={() => setModalCursoAbierto(false)}
        onSuccess={handleCursoCreado}
      />

      {/* 2. Siguiente paso (aparece después de crear un curso) */}
      <SiguientePasoModal
        isOpen={siguientePasoAbierto}
        onClose={() => setSiguientePasoAbierto(false)}
        subtitulo={cursoCreadoNombre}
        opciones={opcionesSiguientePaso}
      />

      {/* 3. Instructor (abierto desde SiguientePasoModal) */}
      <InstructorModal
        isOpen={modalInstructorAbierto}
        onClose={() => setModalInstructorAbierto(false)}
        onSuccess={(instructor) => {
          console.log("Instructor creado desde Cursos:", instructor);
          setModalInstructorAbierto(false);
        }}
      />

      {/* 4. Participante (abierto desde SiguientePasoModal) */}
      <ParticipanteModal
        isOpen={modalParticipanteAbierto}
        onClose={() => setModalParticipanteAbierto(false)}
        onSuccess={(participante) => {
          console.log("Participante creado desde Cursos:", participante);
          setModalParticipanteAbierto(false);
        }}
      />
    </div>
  );
}
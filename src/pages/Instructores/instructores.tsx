// src/pages/Instructores.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Página principal de Instructores.
// Flujo post-creación: InstructorModal → SiguientePasoModal → CursoModal
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Button } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/solid";

import InstructorModal from "../../components/modals/Instructor/instructorModal";
import CursoModal from "../../components/modals/Cursos/cursosModal";
import SiguientePasoModal, {
  type SiguientePasoOpcion,
} from "../../components/common/siguientePasoModal";

// ── Ícono SVG inline ──────────────────────────────────────────────────────────
const IcoCurso = () => (
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
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

// ── Componente ────────────────────────────────────────────────────────────────
export default function Instructores() {
  // ── Estados de modales ───────────────────────────────────────────────────
  const [modalInstructorAbierto, setModalInstructorAbierto] = useState(false);
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [siguientePasoAbierto, setSiguientePasoAbierto] = useState(false);

  // Guardamos el nombre del instructor recién creado
  const [instructorNombre, setInstructorNombre] = useState("");

  // ── Handler: instructor creado exitosamente ──────────────────────────────
  const handleInstructorCreado = (nuevo: any) => {
    const nombre = [nuevo?.nombre, nuevo?.apellidoPaterno]
      .filter(Boolean)
      .join(" ");
    setInstructorNombre(nombre || "El instructor");
    setTimeout(() => setSiguientePasoAbierto(true), 400);
  };

  // ── Opciones del SiguientePasoModal ──────────────────────────────────────
  const opcionesSiguientePaso: SiguientePasoOpcion[] = [
    {
      label: "Asignar a un curso",
      descripcion: "Vincula a este instructor con un curso existente o crea uno nuevo",
      icono: <IcoCurso />,
      color: "from-red-500 to-rose-600",
      onClick: () => setModalCursoAbierto(true),
    },
  ];

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* ── Encabezado de página ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700">
            Instructores
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Alta y gestión de instructores
          </p>
        </div>

        <Button
          onPress={() => setModalInstructorAbierto(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          startContent={<PlusIcon className="w-4 h-4" />}
        >
          Nuevo Instructor
        </Button>
      </div>

      {/* ── Aquí va tu tabla de instructores ─────────────────────────────── */}
      {/* <TablaInstructores /> */}

      {/* ════════════════════════════════════════════════════════════════════
          MODALES
      ════════════════════════════════════════════════════════════════════ */}

      {/* 1. Crear / editar instructor */}
      <InstructorModal
        isOpen={modalInstructorAbierto}
        onClose={() => setModalInstructorAbierto(false)}
        onSuccess={handleInstructorCreado}
      />

      {/* 2. Siguiente paso */}
      <SiguientePasoModal
        isOpen={siguientePasoAbierto}
        onClose={() => setSiguientePasoAbierto(false)}
        subtitulo={instructorNombre}
        opciones={opcionesSiguientePaso}
      />

      {/* 3. Curso (abierto desde SiguientePasoModal) */}
      <CursoModal
        isOpen={modalCursoAbierto}
        onClose={() => setModalCursoAbierto(false)}
        onSuccess={(curso) => {
          console.log("Curso asignado desde Instructores:", curso);
          setModalCursoAbierto(false);
        }}
      />
    </div>
  );
}
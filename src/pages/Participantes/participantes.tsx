// src/pages/Participantes.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Página principal de Participantes.
// Flujo post-creación: ParticipanteModal → SiguientePasoModal → CursoModal
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Button } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/solid";

import ParticipanteModal from "../../components/modals/Participante/participanteModal";
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
export default function Participantes() {
  // ── Estados de modales ───────────────────────────────────────────────────
  const [modalParticipanteAbierto, setModalParticipanteAbierto] = useState(false);
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [siguientePasoAbierto, setSiguientePasoAbierto] = useState(false);

  // Guardamos el nombre del participante recién creado
  const [participanteNombre, setParticipanteNombre] = useState("");

  // ── Handler: participante creado exitosamente ────────────────────────────
  const handleParticipanteCreado = (nuevo: any) => {
    const nombre = [nuevo?.nombre, nuevo?.apellidoPaterno]
      .filter(Boolean)
      .join(" ");
    setParticipanteNombre(nombre || "El participante");
    setTimeout(() => setSiguientePasoAbierto(true), 400);
  };

  // ── Opciones del SiguientePasoModal ──────────────────────────────────────
  const opcionesSiguientePaso: SiguientePasoOpcion[] = [
    {
      label: "Asignar a un curso",
      descripcion: "Inscribe a este participante en un curso existente",
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
            Participantes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Administración de participantes
          </p>
        </div>

        <Button
          onPress={() => setModalParticipanteAbierto(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          startContent={<PlusIcon className="w-4 h-4" />}
        >
          Nuevo Participante
        </Button>
      </div>

      {/* ── Aquí va tu tabla de participantes ────────────────────────────── */}
      {/* <TablaParticipantes /> */}

      {/* ════════════════════════════════════════════════════════════════════
          MODALES
      ════════════════════════════════════════════════════════════════════ */}

      {/* 1. Crear / editar participante */}
      <ParticipanteModal
        isOpen={modalParticipanteAbierto}
        onClose={() => setModalParticipanteAbierto(false)}
        onSuccess={handleParticipanteCreado}
      />

      {/* 2. Siguiente paso */}
      <SiguientePasoModal
        isOpen={siguientePasoAbierto}
        onClose={() => setSiguientePasoAbierto(false)}
        subtitulo={participanteNombre}
        opciones={opcionesSiguientePaso}
      />

      {/* 3. Curso (abierto desde SiguientePasoModal) */}
      <CursoModal
        isOpen={modalCursoAbierto}
        onClose={() => setModalCursoAbierto(false)}
        onSuccess={(curso) => {
          console.log("Curso asignado desde Participantes:", curso);
          setModalCursoAbierto(false);
        }}
      />
    </div>
  );
}
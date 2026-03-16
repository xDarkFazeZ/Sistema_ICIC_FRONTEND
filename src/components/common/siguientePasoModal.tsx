// src/components/modals/common/SiguientePasoModal.tsx

import { Modal, ModalContent, ModalBody } from "@heroui/react";

// ── Icono check SVG ───────────────────────────────────────────────────────────
const IcoCheck = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoChevron = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface SiguientePasoOpcion {
  label: string;
  descripcion: string;
  icono: React.ReactNode;
  /** Clases Tailwind para el gradiente del ícono, ej: "from-emerald-400 to-teal-500" */
  color: string;
  onClick: () => void;
}

interface SiguientePasoModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo?: string;
  /** Nombre del recurso recién creado */
  subtitulo?: string;
  opciones: SiguientePasoOpcion[];
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function SiguientePasoModal({
  isOpen,
  onClose,
  titulo = "¿Qué deseas hacer ahora?",
  subtitulo,
  opciones,
}: SiguientePasoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      classNames={{
        backdrop: "bg-black/30 backdrop-blur-sm",
        base: "border border-slate-200 dark:border-slate-800 shadow-2xl",
      }}
    >
      <ModalContent>
        {() => (
          <ModalBody className="py-6 px-5">
            {/* ── Encabezado ─────────────────────────────────────────────── */}
            <div className="mb-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <IcoCheck />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {titulo}
              </h3>
              {subtitulo && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {subtitulo}
                  </span>{" "}
                  fue registrado correctamente
                </p>
              )}
            </div>

            {/* ── Opciones ───────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              {opciones.map((op, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onClose();
                    // pequeño delay para que el modal cierre antes de abrir el siguiente
                    setTimeout(() => op.onClick(), 150);
                  }}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-200 text-left w-full"
                >
                  {/* Ícono */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${op.color} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}
                  >
                    {op.icono}
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {op.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {op.descripcion}
                    </p>
                  </div>

                  <IcoChevron />
                </button>
              ))}

              {/* Omitir */}
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center mt-1 py-1"
              >
                Omitir por ahora
              </button>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
}